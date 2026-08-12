# OPS-01: Workflow Monitor Agent
**Agent ID:** OPS-01  
**Tier:** Operations Agents  
**Version:** v1.0  
**Status:** 🟢 ACTIVE

## Mandate
Monitor n8n workflows and alert on failure. Output PagerDuty/Slack alert.

## Schedule
Every 5 minutes (`*/5 * * * *`)

## Model
n/a (rule-based)

## Tools
- n8n_api (workflow status)
- pagerduty_api (alerting)
- slack_api (notification)

## Prompt Template
Check all active n8n workflows:
- Last execution status: success/failure
- Error count in last 24h
- Execution time trend (degradation detection)

If failure_rate > 20%: alert via PagerDuty + Slack
If execution_time > 2x baseline: alert via Slack
If all healthy: log "OK" to monitoring dashboard

## Output
Health status + alerts

## SLA
99.5% uptime target

## Governance
All changes must pass through the Mandatory 8-Step Controlled Rewrite Engine.
