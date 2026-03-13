import uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import (
    String,
    Integer,
    Boolean,
    Date,
    Float,
    func,
    ForeignKey,
    DateTime,
    Text,
)
from sqlalchemy.types import UUID
from datetime import date as date_dt, datetime
from typing import Optional, List


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    birthday: Mapped[date_dt] = mapped_column(Date, nullable=False)
    user_name: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    joined_at: Mapped[datetime] = mapped_column(Date, server_default=func.now())
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    phone_number: Mapped[str] = mapped_column(String(15), nullable=False)

    sessions: Mapped[List["Session"]] = relationship(back_populates="user")
    catches: Mapped[List["Catch"]] = relationship(back_populates="user")


class Session(Base):
    __tablename__ = "session"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), nullable=False)

    location_name: Mapped[Optional[str]] = mapped_column(String(100))
    date: Mapped[date_dt] = mapped_column(Date, nullable=False)
    min_depth: Mapped[Optional[float]] = mapped_column(Float)
    max_depth: Mapped[Optional[float]] = mapped_column(Float)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    free_text: Mapped[str] = mapped_column(String)

    # in seconds
    longest_hold_down_time: Mapped[int] = mapped_column(Integer)
    longest_hold_down_depth: Mapped[int] = mapped_column(Integer)

    entry_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    exit_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    visibility: Mapped[int] = mapped_column(Integer)

    user: Mapped["User"] = relationship(back_populates="sessions")
    catches: Mapped[Optional[List["Catch"]]] = relationship(back_populates="session")


class Catch(Base):
    __tablename__ = "catch"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), nullable=False)
    fish_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("fish.id"), nullable=False)
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("session.id"), nullable=False
    )
    weight: Mapped[Optional[float]] = mapped_column(Float)
    free_text: Mapped[Optional[str]] = mapped_column(String)
    image: Mapped[Optional[str]] = mapped_column(String(100))
    catch_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    session: Mapped["Session"] = relationship(back_populates="catches")
    user: Mapped["User"] = relationship(back_populates="catches")
    fish: Mapped["Fish"] = relationship(back_populates="catches")


class Fish(Base):
    __tablename__ = "fish"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    he_name: Mapped[str] = mapped_column(String, nullable=False)
    en_name: Mapped[str] = mapped_column(String, nullable=False)

    catches: Mapped["Catch"] = relationship(back_populates="fish")


# chat
class Guest(Base):
    __tablename__ = "guest"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ChatRoom(Base):
    __tablename__ = "chat_room"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_group: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    participants: Mapped[List["ChatParticipant"]] = relationship(
        "ChatParticipant", back_populates="room", cascade="all, delete"
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="room", cascade="all, delete"
    )


class ChatParticipant(Base):
    __tablename__ = "chat_participant"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    room_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_room.id"), nullable=False
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=True
    )
    guest_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("guest.id"), nullable=True
    )
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    room: Mapped["ChatRoom"] = relationship("ChatRoom", back_populates="participants")
    user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[user_id])
    guest: Mapped[Optional["Guest"]] = relationship("Guest", foreign_keys=[guest_id])


class Message(Base):
    __tablename__ = "message"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    room_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_room.id"), nullable=False
    )
    sender_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=True
    )
    guest_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("guest.id"), nullable=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)  # Encrypted content
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    room: Mapped["ChatRoom"] = relationship("ChatRoom", back_populates="messages")
    sender: Mapped[Optional["User"]] = relationship("User", foreign_keys=[sender_id])
    guest: Mapped[Optional["Guest"]] = relationship("Guest", foreign_keys=[guest_id])
