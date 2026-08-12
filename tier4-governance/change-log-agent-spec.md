# Change Log Agent Spec — Tier 4 Governance & Control
**Agent ID:** T4-03  
**Version:** v5.0  
**Status:** 🟢 ENFORCED

## Mandate
Logs all change requests, validation scores, and timestamps in JSON schema inside CHANGE_LOG.md.

## JSON Schema
```json
{
  "change_id": "CHG-YYYYMMDD-UNIQUE",
  "timestamp": "ISO8601 with SGT offset",
  "authorized_by": "Sam Leong (Primary Architect)",
  "action": "CONTROLLED_REWRITE_EXECUTION",
  "source_lock_id": "ARCHIVE-20260826-001",
  "target_asset": "filename.ext",
  "previous_version": "vX.Y[-ST]",
  "working_version": "vX.Y-draft",
  "ats_score_post_edit": 96.8,
  "rollback_path": "/archive/backups/vX.Y_backup_YYYYMMDD.zip",
  "status": "STAGING_ACTIVE | DEPLOYED | REJECTED"
}
```

## Status Values
- `STAGING_ACTIVE` — Draft in progress
- `DEPLOYED` — Locked and live
- `REJECTED` — Rewrite denied, baseline maintained
