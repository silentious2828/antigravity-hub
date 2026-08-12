"""
CrewAI Flow State Model
Defines the data structure for email triage flow state management.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class EmailProvider(str, Enum):
    """Supported email providers."""
    GMAIL = "gmail"
    OUTLOOK = "outlook"
    UNKNOWN = "unknown"


class ProviderAction(str, Enum):
    """Concrete action path for the selected provider."""
    GMAIL_DRAFT = "gmail_draft"
    OUTLOOK_DRAFT = "outlook_draft"
    UNKNOWN = "unknown"

class TriageCategory(str, Enum):
    """Email triage categories for routing."""
    LOGISTICS = "logistics"
    CLEANUP = "cleanup"
    COMPLIANCE = "compliance"
    SUMMARIZATION = "summarization"
    UNKNOWN = "unknown"

class EmailMetadata(BaseModel):
    """Raw email metadata from incoming message."""
    message_id: str = Field(..., description="Unique message identifier")
    subject: str = Field(..., description="Email subject line")
    sender: str = Field(..., description="Sender email address")
    recipient: str = Field(..., description="Recipient email address")
    cc: List[str] = Field(default_factory=list, description="CC recipients")
    bcc: List[str] = Field(default_factory=list, description="BCC recipients")
    headers: Dict[str, str] = Field(default_factory=dict, description="Email headers")
    body_preview: str = Field(default="", description="First 500 chars of body")
    received_at: str = Field(..., description="ISO timestamp of receipt")
    source_inbox: str = Field(..., description="Source inbox identifier")

class TriageResult(BaseModel):
    """Result of email triage analysis."""
    category: TriageCategory = Field(default=TriageCategory.UNKNOWN, description="Triage category")
    provider: EmailProvider = Field(default=EmailProvider.UNKNOWN, description="Selected provider")
    provider_action: ProviderAction = Field(default=ProviderAction.UNKNOWN, description="Concrete action path")
    priority: str = Field(default="medium", description="Priority level: high/medium/low")
    confidence: float = Field(default=0.0, description="Routing confidence 0-100")
    reasoning: str = Field(default="", description="LLM reasoning for classification")
    entities: Dict[str, Any] = Field(default_factory=dict, description="Extracted entities")
    suggested_actions: List[str] = Field(default_factory=list, description="Recommended actions")

class DraftResult(BaseModel):
    """Result of draft creation."""
    success: bool = Field(..., description="Whether draft was created")
    draft_id: Optional[str] = Field(None, description="Draft identifier")
    provider: EmailProvider = Field(..., description="Provider where draft was created")
    subject: str = Field(..., description="Draft subject")
    recipient: str = Field(..., description="Draft recipient")
    error_message: Optional[str] = Field(None, description="Error if failed")

class EmailFlowState(BaseModel):
    """Complete state for the email triage flow."""
    # Input
    raw_email: EmailMetadata
    
    # Triage results
    triage: Optional[TriageResult] = None
    
    # Draft results
    draft: Optional[DraftResult] = None
    
    # Flow control
    current_step: str = Field(default="start", description="Current flow step")
    retry_count: int = Field(default=0, description="Number of retries")
    error_count: int = Field(default=0, description="Number of errors")
    
    # OmniRoute routing
    routing_chain: str = Field(default="", description="Active OmniRoute chain")
    compression_pct: float = Field(default=0.0, description="Compression percentage")
    
    # HITL compliance
    hitl_review_required: bool = Field(default=True, description="Human review needed")
    
    class Config:
        arbitrary_types_allowed = True
