from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    sender: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatSessionResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatSessionDetail(ChatSessionResponse):
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True
