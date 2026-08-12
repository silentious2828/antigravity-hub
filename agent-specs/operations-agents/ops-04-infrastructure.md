# OPS-04: Infrastructure Agent
**Agent ID:** OPS-04  
**Tier:** Operations Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Backup workflows, rotate API keys, and check token usage. Output Security + cost report.

## Schedule
Daily 05:00 SGT

## Model
n/a (scripted)

## Tools
- aws_cli (infrastructure)
- vault_api (secrets rotation)
- stripe_api (billing check)

## Prompt Template
Daily infrastructure checks:
1. Rotate API keys older than 30 days
2. Backup n8n workflows to S3
3. Check API token balances (Claude, OpenAI, Instantly)
4. Verify Stripe payouts + reconcile with accounting
5. Check for unused resources (stop cost bleed)

If any issue: alert Sam via Slack with priority (high/med/low)

## Output
Security + cost report

## SLA
Daily execution

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
