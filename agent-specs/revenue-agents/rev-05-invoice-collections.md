# REV-05: Invoice & Collections Agent
**Agent ID:** REV-05  
**Tier:** Revenue Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Generate invoice, send reminders, and reconcile Stripe. Output Paid invoice → accounting.

## Schedule
Daily 18:00 SGT (Weekdays)

## Model
gpt-4o (temperature: 0.1)

## Tools
- stripe_api (invoice creation)
- hubspot_api (deal update)
- gmail_api (reminder emails)

## Prompt Template
For each completed milestone:
1. Generate Stripe invoice based on SOW
2. Send payment reminder at 7 days, 14 days, 21 days
3. Update HubSpot deal stage
4. If paid: trigger onboarding workflow (OPS-02)
5. If overdue >30 days: alert Sam for manual follow-up

## Output
Invoice + payment status update

## Next Agent
OPS-02 (onboarding)

## SLA
Invoice sent within 24 hours of milestone completion

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
