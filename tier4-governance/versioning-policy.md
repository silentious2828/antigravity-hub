# Versioning Policy
**Document Control ID:** ARCH-SPEC-RAIN34-20260806  
**Version:** v5.0

## Semantic Versioning
- **MAJOR** — Role vector shift or complete rebrand
- **MINOR** — Section rewrite or new variant addition
- **PATCH** — Typo, date, or metric correction
- **-ST** suffix — Stable / locked
- **-draft** suffix — Work in progress

## Backup Protocol
Before any deployment:
1. Generate zip of current locked version
2. Store in `/backups/` with timestamp
3. Log entry in CHANGE_LOG.md

## Lock Protocol
After deployment:
1. Remove draft suffix
2. Add `-ST` suffix
3. Update registry version field
4. Confirm lock in CHANGE_LOG.md
