from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, constr


# ── Auth ─────────────────────────────────────────────────────────


class SignupRequest(BaseModel):
    organization_name: str
    lab_name: str
    owner_name: str
    owner_email: EmailStr
    owner_phone: str
    password: constr(min_length=8, max_length=72)
    address: str
    escalation_phone: str
    language_preference: Optional[str] = "hi"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    lab_id: Optional[str] = None


# ── Organization ─────────────────────────────────────────────────


class Organization(BaseModel):
    id: str
    name: str
    owner_name: Optional[str] = None
    owner_email: Optional[EmailStr] = None


# ── Lab ──────────────────────────────────────────────────────────


class Lab(BaseModel):
    id: str
    organization_id: str
    name: str
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None
    owner_email: Optional[EmailStr] = None


class LabCreateRequest(BaseModel):
    name: str
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None
    owner_email: Optional[str] = None
    address: str
    escalation_phone: str
    language_preference: Optional[str] = "hi"


class LabSettingsUpdateRequest(BaseModel):
    lab_name: Optional[str] = None
    address: Optional[str] = None
    landmark: Optional[str] = None
    nearest_bus_stop: Optional[str] = None
    parking_available: Optional[bool] = None
    weekday_open: Optional[str] = None
    weekday_close: Optional[str] = None
    saturday_open: Optional[str] = None
    saturday_close: Optional[str] = None
    is_open_sunday: Optional[bool] = None
    sunday_open: Optional[str] = None
    sunday_close: Optional[str] = None
    is_open_public_holidays: Optional[bool] = None
    home_collection_available: Optional[bool] = None
    home_collection_charge: Optional[float] = None
    home_collection_areas: Optional[List[str]] = None
    home_collection_slots: Optional[List[str]] = None
    payment_modes: Optional[List[str]] = None
    walk_in_allowed: Optional[bool] = None
    appointment_required: Optional[bool] = None
    nabl_accredited: Optional[bool] = None
    escalation_phone: Optional[str] = None
    language_preference: Optional[str] = None
    bolna_agent_id: Optional[str] = None
    onboarding_complete: Optional[bool] = None


# ── User ─────────────────────────────────────────────────────────


class User(BaseModel):
    id: str
    organization_id: Optional[str] = None
    lab_id: Optional[str] = None
    name: str
    phone: Optional[str] = None
    email: EmailStr
    role: str
    is_active: bool = True


# ── Reports ──────────────────────────────────────────────────────


class ReportCreateRequest(BaseModel):
    lab_id: str
    token_number: Optional[str] = None
    patient_name: str
    patient_phone: str
    test_name: str
    sample_date: date
    expected_ready_time: Optional[datetime] = None
    status: Optional[str] = "pending"


# ── Tests ────────────────────────────────────────────────────────


class TestCreateRequest(BaseModel):
    lab_id: str
    test_name: str
    test_aliases: Optional[List[str]] = None
    category: Optional[str] = None
    price: float
    turnaround_time_hours: Optional[int] = None
    is_available: Optional[bool] = True
    fasting_required: Optional[bool] = False
    fasting_hours: Optional[int] = None
    sample_type: Optional[str] = None
    notes: Optional[str] = None


class TestUpdateRequest(BaseModel):
    test_name: Optional[str] = None
    test_aliases: Optional[List[str]] = None
    category: Optional[str] = None
    price: Optional[float] = None
    turnaround_time_hours: Optional[int] = None
    is_available: Optional[bool] = None
    fasting_required: Optional[bool] = None
    fasting_hours: Optional[int] = None
    sample_type: Optional[str] = None
    notes: Optional[str] = None


class TestPrepResponse(BaseModel):
    test_name: Optional[str] = None
    fasting_required: Optional[bool] = None
    fasting_hours: Optional[int] = None
    sample_type: Optional[str] = None
    notes: Optional[str] = None


# ── Home Collections ─────────────────────────────────────────────


class HomeCollectionCreateRequest(BaseModel):
    lab_id: str
    booking_ref: str
    patient_name: str
    patient_phone: str
    address: str
    area: Optional[str] = None
    test_names: List[str]
    preferred_date: date
    preferred_time: str
    notes: Optional[str] = None


class HomeCollectionStatusUpdate(BaseModel):
    status: str
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


# ── Call Logs ────────────────────────────────────────────────────


class CallLogCreateRequest(BaseModel):
    lab_id: str
    bolna_call_id: Optional[str] = None
    caller_phone: Optional[str] = None
    call_time: datetime
    duration_seconds: Optional[int] = None
    language_detected: Optional[str] = None
    flow_triggered: Optional[str] = None
    outcome: Optional[str] = None
    transfer_reason: Optional[str] = None
    summary: Optional[str] = None
    recording_url: Optional[str] = None


class CallStatsResponse(BaseModel):
    period: str
    total_calls: int
    auto_resolved: int
    transferred: int
    logged: int
    automation_rate: float


# ── Bolna Webhook ────────────────────────────────────────────────


class BolnaToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any]


class BolnaWebhookPayload(BaseModel):
    call_id: str
    lab_id: str
    caller_phone: Optional[str] = None
    duration_seconds: int
    language_detected: str
    flow_triggered: str
    outcome: str
    transfer_reason: Optional[str] = None
    summary: Optional[str] = None
    recording_url: Optional[str] = None
    tool_calls: Optional[List[BolnaToolCall]] = None
    raw_metadata: Optional[Dict[str, Any]] = None


# ── Dashboard ────────────────────────────────────────────────────


class DashboardStatsResponse(BaseModel):
    reports_today: int
    reports_ready_today: int
    home_collections_today: int
    calls_today: int
    automation_rate_today: float
