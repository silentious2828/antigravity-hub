# INT-03: Forecasting Agent
**Agent ID:** INT-03  
**Tier:** Intelligence Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Predict revenue, pipeline value, and resource needs. Output 90-day forecast.

## Schedule
Weekly Sunday 20:00 SGT

## Model
claude-3.5-sonnet (temperature: 0.2)

## Tools
- postgresql (historical data)
- notion_api (forecast doc)

## Prompt Template
Generate 90-day forecast based on:
1. Current pipeline (HubSpot deal stages + probabilities)
2. Historical conversion rates by stage
3. Seasonality (ASEAN fiscal year, holidays)
4. Agent capacity constraints

Output: 90-day revenue forecast (low/base/high) + resource needs

## Output
Forecast doc in Notion

## SLA
Weekly Sunday delivery

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
