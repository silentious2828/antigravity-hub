# Rewrite Governance Policy
**Document Control ID:** ARCH-SPEC-RAIN34-20260806  
**Archive Lock ID:** ARCHIVE-20260826-001  
**Version:** v5.0  
**Status:** ENFORCED  
**Primary Architect:** Sam Leong

## 1. Purpose
Prevent narrative drift and unmeasured edits to locked core assets.

## 2. Default State
All core assets are **NO-REWRITE** unless a validated trigger is confirmed.

## 3. Rewrite Triggers (Any One Validates)
1. KPI Deficit — Conversion < 15% / ATS Match < 75%
2. Role Shift — Target Scope Pivot (e.g., Pure C-Suite)
3. Major Achievement — New Board Position / Global Award
4. Market Signal — Recruiter Feedback Pattern > 5 Contacts
5. Strategic Pivot — Geographic or Sector Realignment

## 4. Mandatory 8-Step Controlled Rewrite Process
1. Trigger Audit
2. Change Logging (JSON Schema)
3. Staging Branching (vX.Y-draft)
4. Drafting Edit
5. ATS Scan Gate (≥85% Match)
6. Cross-Sync Check (Dossier/CV)
7. Rollback Backup Zip Creation
8. Deploy & Lock

## 5. Enforcement
- No edits bypass this process
- All changes logged to CHANGE_LOG.md with JSON schema
- Rollback backups stored in `/backups/` prior to deployment
