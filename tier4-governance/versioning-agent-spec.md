# Versioning Agent Spec — Tier 4 Governance & Control
**Agent ID:** T4-02  
**Version:** v5.0  
**Status:** 🟢 ENFORCED

## Mandate
Applies semantic versioning (vMAJOR.MINOR.PATCH) and generates backup zip archives prior to deployment.

## Versioning Rules
- **MAJOR:** Role vector shift or complete rebrand
- **MINOR:** Section rewrite or new variant addition
- **PATCH:** Typo, date, or metric correction
- **-ST:** Stable/locked suffix
- **-draft:** Work-in-progress suffix

## Backup Protocol
1. Pre-deployment: Generate zip of current locked version
2. Store in `/backups/` with timestamp
3. Log entry in CHANGE_LOG.md

## Lock Protocol
1. Remove draft suffix
2. Add `-ST` suffix
3. Update registry version field
4. Confirm lock in CHANGE_LOG.md
