# OPS-02: QA Auto Agent
**Agent ID:** OPS-02  
**Tier:** Operations Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Run regression tests on client automations. Output Pass/Fail report.

## Schedule
Daily 02:00 SGT

## Model
claude-3.5-sonnet (temperature: 0.2)

## Tools
- playwright (browser automation testing)
- hubspot_api (client data)

## Prompt Template
For each active client automation:
1. Run end-to-end test (playwright script per workflow)
2. Check output quality (sample 10 recent outputs)
3. Verify API integrations still responding
4. Log pass/fail + anomalies

If fail: create ticket in HubSpot + alert Sam
If anomaly detected: flag for weekly review

## Output
QA report per client

## SLA
All clients tested daily

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
