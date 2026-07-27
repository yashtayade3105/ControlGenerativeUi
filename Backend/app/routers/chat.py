import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from jose import jwt, JWTError
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime
from app.config import settings
from app.db.session import get_db
from app.db.models import User, ChatSession, ChatMessage
from app.schemas.chat import ChatSessionResponse, ChatSessionDetail, ChatSessionCreate, ChatMessageResponse, ChatMessageCreate
from app.services.chatbot import get_thesys_chat_response, query_sgbau_knowledge_base
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
async def send_message_stream(
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

    # Perform DB RAG facts lookup
    db_facts = await query_sgbau_knowledge_base(payload.content, db)

    # Call Thesys / OpenAI compatible API stream
    async def chat_response_generator():
        response_stream = await get_thesys_chat_response(formatted_history, db_facts)
        
        full_reply = ""
        
        if hasattr(response_stream, "__aiter__"):
            async for chunk in response_stream:
                if isinstance(chunk, str):
                    content = chunk
                else:
                    try:
                        content = chunk.choices[0].delta.content
                    except (AttributeError, IndexError):
                        content = str(chunk)
                if content:
                    full_reply += content
        else:
            # Fallback list handler
            for content in response_stream:
                full_reply += content

        # Perform strict validation on full reply
        try:
            # Clean and parse system think blocks out of output
            cleaned_reply = re.sub(r"<think>[\s\S]*?<\/think>", "", full_reply, flags=re.IGNORECASE).strip()
            # Strip code block decorators
            cleaned_reply = re.sub(r"^```json\s*", "", cleaned_reply, flags=re.IGNORECASE)
            cleaned_reply = re.sub(r"\s*```$", "", cleaned_reply)
            
            validated_data = validate_and_repair_json(cleaned_reply)
            saved_content = json.dumps(validated_data)
        except Exception as e:
            print(f"GenUI Contract Validation Error: {e}")
            # Dynamic fallback creation matching registry components
            fallback_error = {
                "version": "1.0",
                "intent": "error",
                "confidence": 1.0,
                "components": [
                  {
                    "type": "Callout",
                    "props": {
                      "tone": "danger",
                      "text": f"Error validating component structure: {str(e)}"
                    }
                  },
                  {
                    "type": "Callout",
                    "props": {
                      "tone": "info",
                      "text": f"Raw Response: {full_reply[:200]}"
                    }
                  }
                ],
                "sources": [{"type": "tool", "name": "validation_layer"}]
            }
            saved_content = json.dumps(fallback_error)

        # Save assistant message to DB
        async with db.begin_nested() if db.in_nested_transaction() else db as transaction:
            assistant_message = ChatMessage(
                session_id=session.id,
                sender="assistant",
                content=saved_content
            )
            db.add(assistant_message)
            session.updated_at = datetime.utcnow()
            await db.commit()

        # Yield parsable dynamic specifications
        yield saved_content

    return StreamingResponse(chat_response_generator(), media_type="application/json")
