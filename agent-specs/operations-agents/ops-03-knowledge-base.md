# OPS-03: Knowledge Base Agent
**Agent ID:** OPS-03  
**Tier:** Operations Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Sync SOPs, case studies, and pricing docs to Notion/GitBook. Output Updated knowledge base.

## Schedule
Weekly Sunday 06:00 SGT

## Model
claude-3.5-sonnet (temperature: 0.3)

## Tools
- notion_api (wiki updates)
- gdrive_api (case study sync)

## Prompt Template
Weekly knowledge sync:
1. Pull new case studies from completed projects
2. Update pricing matrix if market rates changed
3. Add new client pain points to objection handling doc
4. Archive outdated workflows/templates

## Output
Updated Notion wiki

## SLA
Weekly refresh

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
