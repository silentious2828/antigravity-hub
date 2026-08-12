# REV-03: Lead Qualification Agent
**Agent ID:** REV-03  
**Tier:** Revenue Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Score leads in real-time via Claude API based on company size, tech stack, and pain signals. Output Hot/Warm/Cold lead tiers.

## Schedule
Real-time via webhook

## Model
gpt-4o (temperature: 0.1)

## Tools
- hubspot_api (CRM update)
- claude_analysis (reply sentiment)

## Prompt Template
Score this lead 0-100 based on:
- Company fit (SAP user? Logistics vertical? ASEAN-based?) — 40 points
- Title seniority (C-level = 40, Director = 30, Manager = 20) — 30 points
- Pain signal strength (job posting keywords, news) — 20 points
- Engagement (opened email? clicked link?) — 10 points

Output: JSON {lead_id, score, tier, reasoning, recommended_action}

## Output
Lead score + CRM update

## Next Agent
- If score >80: REV-04 (proposal)
- If score 50-80: nurture sequence
- If score <50: discard

## SLA
Real-time scoring within 5 minutes of inbound lead

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
