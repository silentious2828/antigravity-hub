"""
Unified Email Draft Tool (CrewAI BaseTool)

Provides a single interface for creating email drafts across Gmail and Outlook.
HITL compliant: draft-only, never sends automatically.
"""
from __future__ import annotations

import os
from typing import Any, Dict, Optional, Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from crewai_flow.state_model import EmailProvider


# ---------------------------------------------------------------------------
# Tool Input Schema
# ---------------------------------------------------------------------------

class UnifiedDraftInput(BaseModel):
    provider: str = Field(..., description="Target provider: 'gmail' or 'outlook'")
    subject: str = Field(..., description="Draft subject line")
    body: str = Field(..., description="Draft body content")
    recipient: str = Field(..., description="Recipient email address")
    cc: Optional[str] = Field(None, description="CC recipients (comma-separated)")
    draft_id: Optional[str] = Field(None, description="Existing draft ID for updates")


# ---------------------------------------------------------------------------
# Unified Email Draft Tool
# ---------------------------------------------------------------------------

class UnifiedEmailDraftTool(BaseTool):
    """CrewAI BaseTool for creating email drafts on Gmail or Outlook.

    HITL boundary: this tool ONLY creates drafts. It never sends emails.
    """

    name: str = "unified_email_draft_tool"
    description: str = (
        "Create an email draft on Gmail or Outlook. "
        "Input: provider ('gmail' or 'outlook'), subject, body, recipient. "
        "Returns draft_id on success. Never sends automatically."
    )
    args_schema: Type[BaseModel] = UnifiedDraftInput

    # ------------------------------------------------------------------
    # Gmail Draft Creation
    # ------------------------------------------------------------------

    def _create_gmail_draft(self, draft_input: UnifiedDraftInput) -> Dict[str, Any]:
        """Create a draft in Gmail via Gmail API."""
        try:
            from googleapiclient.discovery import build
            from google.oauth2.credentials import Credentials

            creds = self._get_gmail_credentials()
            service = build("gmail", "v1", credentials=creds)

            message = {
                "message": {
                    "raw": self._encode_message(
                        to=draft_input.recipient,
                        subject=draft_input.subject,
                        body=draft_input.body,
                        cc=draft_input.cc,
                    )
                }
            }

            if draft_input.draft_id:
                result = (
                    service.users()
                    .drafts()
                    .update(userId="me", id=draft_input.draft_id, body=message)
                    .execute()
                )
            else:
                result = service.users().drafts().create(userId="me", body=message).execute()

            return {
                "success": True,
                "draft_id": result.get("id"),
                "provider": "gmail",
                "subject": draft_input.subject,
                "recipient": draft_input.recipient,
            }
        except ImportError:
            return {
                "success": False,
                "draft_id": None,
                "provider": "gmail",
                "subject": draft_input.subject,
                "recipient": draft_input.recipient,
                "error_message": "google-api-python-client not installed. Run: pip install google-api-python-client",
            }
        except Exception as e:
            return {
                "success": False,
                "draft_id": None,
                "provider": "gmail",
                "subject": draft_input.subject,
                "recipient": draft_input.recipient,
                "error_message": str(e),
            }

    # ------------------------------------------------------------------
    # Outlook Draft Creation
    # ------------------------------------------------------------------

    def _create_outlook_draft(self, draft_input: UnifiedDraftInput) -> Dict[str, Any]:
        """Create a draft in Outlook via Microsoft Graph API."""
        try:
            import msal
            import requests

            access_token = self._get_outlook_token()
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }

            message_body = {
                "subject": draft_input.subject,
                "body": {"contentType": "Text", "content": draft_input.body},
                "toRecipients": [{"emailAddress": {"address": draft_input.recipient}}],
            }
            if draft_input.cc:
                message_body["ccRecipients"] = [
                    {"emailAddress": {"address": addr.strip()}}
                    for addr in draft_input.cc.split(",")
                ]

            if draft_input.draft_id:
                resp = requests.patch(
                    f"https://graph.microsoft.com/v1.0/me/drafts/{draft_input.draft_id}",
                    headers=headers,
                    json=message_body,
                )
            else:
                resp = requests.post(
                    "https://graph.microsoft.com/v1.0/me/drafts",
                    headers=headers,
                    json={"message": message_body},
                )

            if resp.status_code in (200, 201):
                data = resp.json()
                return {
                    "success": True,
                    "draft_id": data.get("id"),
                    "provider": "outlook",
                    "subject": draft_input.subject,
                    "recipient": draft_input.recipient,
                }
            return {
                "success": False,
                "draft_id": None,
                "provider": "outlook",
                "subject": draft_input.subject,
                "recipient": draft_input.recipient,
                "error_message": f"Graph API error {resp.status_code}: {resp.text}",
            }
        except ImportError:
            return {
                "success": False,
                "draft_id": None,
                "provider": "outlook",
                "subject": draft_input.subject,
                "recipient": draft_input.recipient,
                "error_message": "msal not installed. Run: pip install msal requests",
            }
        except Exception as e:
            return {
                "success": False,
                "draft_id": None,
                "provider": "outlook",
                "subject": draft_input.subject,
                "recipient": draft_input.recipient,
                "error_message": str(e),
            }

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------

    def _run(
        self,
        provider: str,
        subject: str,
        body: str,
        recipient: str,
        cc: Optional[str] = None,
        draft_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        draft_input = UnifiedDraftInput(
            provider=provider,
            subject=subject,
            body=body,
            recipient=recipient,
            cc=cc,
            draft_id=draft_id,
        )

        provider_lower = provider.lower()
        if provider_lower == "gmail":
            return self._create_gmail_draft(draft_input)
        if provider_lower == "outlook":
            return self._create_outlook_draft(draft_input)

        return {
            "success": False,
            "draft_id": None,
            "provider": provider,
            "subject": subject,
            "recipient": recipient,
            "error_message": f"Unsupported provider: {provider}. Use 'gmail' or 'outlook'.",
        }

    # ------------------------------------------------------------------
    # Credential helpers (stubs - wire to your OAuth flow)
    # ------------------------------------------------------------------

    def _get_gmail_credentials(self):
        """Retrieve Gmail OAuth2 credentials.

        TODO: Wire to your OAuth flow (client_secret.json + token.json).
        """
        token_path = os.getenv("GMAIL_TOKEN_PATH", "token.json")
        creds_path = os.getenv("GMAIL_CREDENTIALS_PATH", "client_secret.json")

        from google.oauth2.credentials import Credentials

        if os.path.exists(token_path):
            return Credentials.from_authorized_user_file(token_path)

        raise RuntimeError(
            f"Gmail token not found at {token_path}. "
            "Run get_gmail_creds() to authenticate."
        )

    def _get_outlook_token(self) -> str:
        """Retrieve Outlook access token via MSAL.

        TODO: Wire to your MSAL cache (outlook_token_cache.json).
        """
        cache_path = os.getenv("OUTLOOK_TOKEN_CACHE", "outlook_token_cache.json")
        if not os.path.exists(cache_path):
            raise RuntimeError(
                f"Outlook token cache not found at {cache_path}. "
                "Run MSAL authentication flow first."
            )

        import msal

        client_id = os.environ["OUTLOOK_CLIENT_ID"]
        tenant_id = os.environ.get("OUTLOOK_TENANT_ID", "common")
        authority = f"https://login.microsoftonline.com/{tenant_id}"

        cache = msal.SerializableTokenCache()
        with open(cache_path, "r") as f:
            cache.deserialize(f.read())

        app = msal.PublicClientApplication(client_id, authority=authority, token_cache=cache)
        accounts = app.get_accounts()
        if not accounts:
            raise RuntimeError("No cached Outlook accounts. Re-authenticate.")

        result = app.acquire_token_silent(
            ["Mail.ReadWrite", "offline_access"],
            account=accounts[0],
        )
        if not result:
            raise RuntimeError("Silent token acquisition failed. Re-authenticate.")

        return result["access_token"]

    # ------------------------------------------------------------------
    # MIME encoding helper
    # ------------------------------------------------------------------

    def _encode_message(self, to: str, subject: str, body: str, cc: Optional[str] = None) -> str:
        """Encode email as base64url MIME message for Gmail API."""
        import email
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        import base64

        msg = MIMEMultipart()
        msg["to"] = to
        msg["subject"] = subject
        if cc:
            msg["cc"] = cc
        msg.attach(MIMEText(body, "plain"))

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
        return raw
