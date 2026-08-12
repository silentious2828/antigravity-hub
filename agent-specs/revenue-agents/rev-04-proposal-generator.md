# REV-04: Proposal Generator Agent
**Agent ID:** REV-04  
**Tier:** Revenue Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Generate custom SOW, pricing, and timeline for hot leads. Output PDF proposal + Calendly link.

## Schedule
On-demand (triggered by REV-03 hot lead)

## Model
claude-3.5-sonnet (temperature: 0.2)

## Tools
- notion_api (template retrieval)
- pdf_generator (proposal output)
- calendly_api (booking link)

## Prompt Template
Generate a custom proposal for:
- Client: {company}, {industry}
- Contact: {name}, {title}
- Pain points: {pain_points}
- Recommended package: {tier}

Structure:
1. Executive Summary (2 sentences: their pain + your outcome)
2. Scope of Work (3 bullets, max)
3. Investment (show Quick Win → Core → Scale)
4. Timeline (7-day Quick Win, 14-day Core)
5. Why us (3 bullets: SAP MM expertise, 30% efficiency gains, ASEAN focus)
6. Next step (Calendly link for 15-min discovery call)

Tone: Professional, specific, no fluff. Reference their industry explicitly.

## Output
PDF proposal + Calendly link

## Next Agent
Sam approval gate (human-in-the-loop)

## SLA
15 minutes from trigger

## Human Gate
MANDATORY — Sam reviews all proposals before send

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
