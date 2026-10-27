from sqlmodel import SQLModel, Field
from pydantic import EmailStr
from typing import Optional
from datetime import datetime, timezone
from enum import Enum


# ENUM for user enquiry status PENDING, COMPLETED
class EnquiryStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class UserTable(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str = Field(index=True)
    corporate_email: EmailStr = Field(index=True)
    phone_number: str = Field(index=True)
    company_name: str = Field(index=True)
    employee_count: Optional[str] = Field(default=None)
    primary_interest: Optional[str] = Field(default=None)
    specific_requirements: Optional[str] = Field(default=None)
    status: EnquiryStatus = Field(default=EnquiryStatus.PENDING)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class UserRequestModel(SQLModel):
    id: Optional[int] = Field(default=None)
    full_name: str = Field(min_length=3)
    corporate_email: EmailStr
    phone_number: str
    company_name: str = Field(min_length=3)
    employee_count: Optional[str] = Field(default=None)
    primary_interest: Optional[str] = Field(default=None)
    specific_requirements: Optional[str] = Field(default=None)
    status: EnquiryStatus = Field(default=EnquiryStatus.PENDING)
    created_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class UserResponseModel(SQLModel):
    status: str = Field(default="success")
    message: str


class ListUsers(SQLModel):
    status: str = Field(default="success")
    count: int
    users: list[UserRequestModel]


class UpdateEnquiryStatus(SQLModel):
    status: EnquiryStatus


# FOR WEBSOCKET

# --- LIVE CHAT MODELS ---

class SenderRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

    AI = "ai"  # <-- NEW: Identifies messages sent by the LangGraph AI Bot!


class ChatSession(SQLModel, table=True):
    """
    Stores each visitor's chat identity, secret session_token, and AI vs Human state.
    """

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    corporate_email: EmailStr = Field(
        index=True,
        unique=True
    )

    full_name: str
    session_token: str

    # <-- NEW: False = AI Mode, True = Human Admin Mode
    is_escalated: bool = Field(default=False)

    # <-- NEW: Why they asked for an admin
    escalation_reason: Optional[str] = Field(default=None)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    last_active_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class ChatMessage(SQLModel, table=True):
    """
    Stores every chat message (AI, 1-on-1 Human, and Admin Broadcasts) in SQLite.
    """

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    user_email: str = Field(index=True)
    user_name: str

    sender_role: SenderRole  # "user", "admin", or "ai"

    message: str = Field(
        min_length=1,
        max_length=4000
    )
    is_broadcast: bool = Field(default=False)
    is_read_by_admin: bool = Field(default=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class IncomingChatPayload(SQLModel):
    """Pydantic validator for incoming WebSocket JSON messages."""

    to_email: Optional[str] = Field(default=None)
    message: Optional[str] = Field(
        default=None,
        max_length=2000
    )
    # <-- NEW: Allows visitor to click "yes" or "no" on the HITL confirmation buttons!
    hitl_decision: Optional[str] = Field(default=None)
