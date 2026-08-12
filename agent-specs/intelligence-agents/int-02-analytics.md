# INT-02: Analytics Agent
**Agent ID:** INT-02  
**Tier:** Intelligence Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Consolidate revenue, conversion, and churn metrics. Output Dashboard update.

## Schedule
Daily 08:00 SGT

## Model
n/a (SQL-based)

## Tools
- postgresql (data warehouse)
- metabase_api (dashboard)

## Prompt Template
Daily metrics pull:
1. Leads generated (yesterday)
2. Outreach sent, open rate, reply rate
3. Pipeline value by stage
4. Revenue (new + recurring)
5. Agent uptime %
6. Token spend vs budget

Update Metabase dashboard
Alert Sam if any metric drops >20% vs 7-day avg

## Output
Dashboard update + alerts

## SLA
Daily by 08:30 SGT

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
