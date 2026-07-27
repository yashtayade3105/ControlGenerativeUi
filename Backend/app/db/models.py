import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String, nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("ChatSession", back_populates="messages")

class College(Base):
    __tablename__ = "colleges"
    
    college_code = Column(Integer, primary_key=True, index=True)
    college_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    college_type = Column(String, nullable=False)
    website_link = Column(String, nullable=True)
    
    cutoffs = relationship("Cutoff", back_populates="college", cascade="all, delete-orphan")

class Cutoff(Base):
    __tablename__ = "cutoffs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    college_code = Column(Integer, ForeignKey("colleges.college_code", ondelete="CASCADE"), nullable=False)
    branch = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    category = Column(String, nullable=False)
    cutoff_percentile = Column(Float, nullable=False)
    cap_round = Column(Integer, nullable=False)
    
    college = relationship("College", back_populates="cutoffs")
