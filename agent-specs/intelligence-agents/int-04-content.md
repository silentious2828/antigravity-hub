# INT-04: Content Agent
**Agent ID:** INT-04  
**Tier:** Intelligence Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Generate LinkedIn posts, case studies, and email templates. Output Content calendar populated.

## Schedule
Monday/Wednesday/Friday 10:00 SGT

## Model
claude-3.5-sonnet (temperature: 0.7)

## Tools
- linkedin_api (post scheduling)
- notion_api (content calendar)

## Prompt Template
Generate content for next 7 days:
- 3 LinkedIn posts (supply chain + AI insights)
- 2 case study snippets (anonymized client wins)
- 1 outreach email template update

Rules:
- No AI hype words ("revolutionize", "cutting-edge")
- Lead with specific metric or client pain point
- Include clear CTA (comment, DM, Calendly)
- Keep posts under 150 words

## Output
Content calendar populated

## Next Agent
Sam approval gate for first post

## SLA
Weekly content batch

## Human Gate
Sam approves first post of each batch

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
