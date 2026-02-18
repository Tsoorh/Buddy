import uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, Date, Float, func, ForeignKey,DateTime
from sqlalchemy.types import UUID
from datetime import date, datetime
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
    birthday: Mapped[date] = mapped_column(Date, nullable=False)
    user_name: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    joined_at: Mapped[datetime] = mapped_column(Date, server_default=func.now())
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    experience_years: Mapped[int] = mapped_column(Integer, nullable=False)

    sessions: Mapped[List["Session"]] = relationship(back_populates="user")
    catches: Mapped[List["Catch"]] = relationship(back_populates="user")


class Session(Base):
    __tablename__ = "session"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), nullable=False)

    location_name: Mapped[Optional[str]] = mapped_column(String(100))
    date: Mapped[date] = mapped_column(Date, nullable=False)
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
