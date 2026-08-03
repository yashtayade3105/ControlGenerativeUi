import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime
from app.config import settings
from app.db.session import get_db
from app.db.models import User, ChatSession, ChatMessage
from app.schemas.chat import ChatSessionResponse, ChatSessionDetail, ChatSessionCreate, ChatMessageResponse, ChatMessageCreate
from app.services.chatbot import query_sgbau_knowledge_base
import json
import re
from app.services.validator import validate_and_repair_json

router = APIRouter(prefix="/chats", tags=["Chat & Sessions"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).filter(User.id == uuid.UUID(user_id)))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

@router.post("", response_model=ChatSessionResponse)
async def create_session(payload: ChatSessionCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    session = ChatSession(
        user_id=current_user.id,
        title=payload.title
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("", response_model=List[ChatSessionResponse])
async def list_sessions(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
    )
    return result.scalars().all()

@router.get("/{session_id}", response_model=ChatSessionDetail)
async def get_session_detail(session_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession)
        .filter(and_(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")
        
    # Query messages
    msg_result = await db.execute(
        select(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = msg_result.scalars().all()
    
    # Return custom response mapping dictionary to bypass lazy relation check trigger crash
    return {
        "id": session.id,
        "title": session.title,
        "created_at": session.created_at,
        "updated_at": session.updated_at,
        "messages": messages
    }

@router.delete("/{session_id}")
async def delete_session(session_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession)
        .filter(and_(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")
        
    await db.delete(session)
    await db.commit()
    return {"message": "Chat session deleted successfully."}

@router.post("/{session_id}/send")
async def send_message(
    session_id: uuid.UUID,
    payload: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify session belongs to user
    sess_result = await db.execute(
        select(ChatSession)
        .filter(and_(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    )
    session = sess_result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    # Save user message to database
    user_message = ChatMessage(
        session_id=session.id,
        sender="user",
        content=payload.content
    )
    db.add(user_message)
    await db.commit()

    # Load chat history for context
    history_result = await db.execute(
        select(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
    )
    past_messages = history_result.scalars().all()
    
    formatted_history = [
        {"role": "user" if m.sender == "user" else "assistant", "content": m.content}
        for m in past_messages
    ]

    # Call LLM API (non-streaming, direct JSON retrieval)
    # Perform DB RAG facts lookup
    db_facts = await query_sgbau_knowledge_base(payload.content, db)

    from fastapi.responses import StreamingResponse
    from app.services.chatbot import get_llm_chat_stream_response

    async def generate_response():
        full_reply_buffer = ""
        try:
            async for chunk in get_llm_chat_stream_response(formatted_history, db_facts):
                full_reply_buffer += chunk
                yield chunk
        finally:
            # Reconstruct the spec JSON
            parsed_components = []
            for line in full_reply_buffer.split('\n'):
                line = line.strip()
                if line:
                    try:
                        parsed = json.loads(line)
                        if isinstance(parsed, dict) and "components" in parsed and "type" not in parsed:
                            # The LLM ignored instructions and output a wrapped root object on a single line
                            if isinstance(parsed["components"], list):
                                parsed_components.extend(parsed["components"])
                        else:
                            parsed_components.append(parsed)
                    except Exception:
                        pass
            
            # If JSONL parsing completely failed, it might be a multi-line JSON object. 
            # Let the robust repair validator attempt it.
            validated_spec_dict = None
            if not parsed_components:
                try:
                    validated_spec_dict = validate_and_repair_json(full_reply_buffer)
                except Exception:
                    pass
            
            if not validated_spec_dict:
                # Use a robust fallback if nothing parsed
                if not parsed_components:
                    parsed_components = [{
                        "type": "Callout",
                        "props": {"tone": "danger", "text": "Validation Error: Stream did not produce valid JSONL components."}
                    }]
                    
                # Construct a raw spec to pass through validation
                raw_spec = json.dumps({
                    "components": parsed_components
                })
                
                try:
                    validated_spec_dict = validate_and_repair_json(raw_spec)
                except Exception as e:
                    pass
            
            if validated_spec_dict:
                saved_content = json.dumps(validated_spec_dict)
            else:
                # Fallback if validator entirely fails
                saved_content = json.dumps({
                    "version": "1.0",
                    "intent": "error",
                    "confidence": 0.0,
                    "components": [{
                        "id": "cmp_err_001",
                        "type": "Callout",
                        "props": {"tone": "danger", "text": "Server Validation Error: Critical failure parsing LLM stream"}
                    }]
                })
            
            # We must open a new DB session since the request-scoped one is likely closed
            from app.db.session import AsyncSessionLocal
            from sqlalchemy import update
            async with AsyncSessionLocal() as background_db:
                assistant_message = ChatMessage(
                    session_id=session_id,
                    sender="assistant",
                    content=saved_content
                )
                background_db.add(assistant_message)
                await background_db.execute(
                    update(ChatSession).where(ChatSession.id == session_id).values(updated_at=datetime.utcnow())
                )
                await background_db.commit()

    return StreamingResponse(generate_response(), media_type="application/x-ndjson")
