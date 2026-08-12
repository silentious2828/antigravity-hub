# AI Enterprise Operational Framework
**Version:** v1.0  
**Status:** Production-Ready  
**Business Model:** AI Automation Agency — Supply Chain / SAP Niche  
**Operator:** Sam Leong (Human-in-the-Loop)

---

## 1. AGENT CONFIGURATION REGISTRY

### 1.1 Core Revenue Agents

#### REV-01: Lead Research Agent
```yaml
agent_id: REV-01
name: "Supply Chain Lead Hunter"
schedule: "0 8 * * 1-5"  # Weekdays 8AM SGT
model: claude-3.5-sonnet
temperature: 0.3
tools:
  - apollo.io (lead search)
  - hunter.io (email verification)
  - linkedin_scraper (company + title)
  - claude_web_search (pain point discovery)
prompt_template: |
  You are a B2B lead researcher specializing in SAP/ERP decision-makers 
  in ASEAN logistics and distribution companies.
  
  Target criteria:
  - Company: Logistics, freight forwarding, trading, automotive distribution
  - Geography: Singapore, Malaysia, Indonesia, Thailand, Vietnam, Philippines
  - Titles: Head of Supply Chain, SAP MM Lead, Operations Director, CFO
  - Size: 50–500 employees (SMB sweet spot)
  
  For each lead, extract:
  - Full name, title, company
  - LinkedIn URL
  - Company size, industry, recent tech news
  - Likely pain points (inferred from job posting keywords, news)
  
  Output: CSV with columns: name, email, title, company, pain_points, priority_score
output: /data/leads/daily_leads_{date}.csv
next_agent: REV-02
sla: 50 qualified leads per run
```

#### REV-02: Cold Outreach Agent
```yaml
agent_id: REV-02
name: "Personalized Outreach Writer"
schedule: "0 9 * * 1-5"  # Weekdays 9AM SGT
model: claude-3.5-sonnet
temperature: 0.7
tools:
  - instantly_api (email sending)
  - calendly_api (booking link injection)
  - claude_web_search (company personalization)
prompt_template: |
  You are an expert cold email copywriter for B2B supply chain services.
  
  Write a personalized cold email for:
  - Recipient: {name}, {title} at {company}
  - Pain point: {pain_point}
  - Your offer: S$1,500 automation audit (credits toward project)
  
  Rules:
  - Subject line: specific to their industry, no "AI" hype words
  - Body: 120 words max, 1 clear CTA
  - Tone: peer-to-peer, not salesy
  - Include: "I've automated procurement workflows for similar {industry} companies"
  - End with Calendly link for S$500 diagnostic
  
  Do NOT use: "revolutionize", "leverage AI", "cutting-edge", "game-changing"
output: Personalized email per lead
next_agent: REV-03
sla: 50 emails sent per run
human_gate: First 10 emails require Sam approval
```

#### REV-03: Lead Qualification Agent
```yaml
agent_id: REV-03
name: "Lead Scorer"
schedule: "0 10 * * 1-5"  # Real-time via webhook
model: gpt-4o
temperature: 0.1
tools:
  - hubspot_api (CRM update)
  - claude_analysis (reply sentiment)
prompt_template: |
  Score this lead 0-100 based on:
  - Company fit (SAP user? Logistics vertical? ASEAN-based?) — 40 points
  - Title seniority (C-level = 40, Director = 30, Manager = 20) — 30 points
  - Pain signal strength (job posting keywords, news) — 20 points
  - Engagement (opened email? clicked link?) — 10 points
  
  Output: JSON {lead_id, score, tier, reasoning, recommended_action}
output: Lead score + CRM update
next_agent: 
  - If score >80: REV-04 (proposal)
  - If score 50-80: nurture sequence
  - If score <50: discard
sla: Real-time scoring within 5 minutes of inbound lead
```

#### REV-04: Proposal Generator Agent
```yaml
agent_id: REV-04
name: "Proposal Engine"
schedule: "on_demand"  # Triggered by REV-03 hot lead
model: claude-3.5-sonnet
temperature: 0.2
tools:
  - notion_api (template retrieval)
  - pdf_generator (proposal output)
  - calendly_api (booking link)
prompt_template: |
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
output: PDF proposal + Calendly link
next_agent: Sam approval gate (human-in-the-loop)
sla: 15 minutes from trigger
human_gate: MANDATORY — Sam reviews all proposals before send
```

#### REV-05: Invoice & Collections Agent
```yaml
agent_id: REV-05
name: "Billing & Collections"
schedule: "0 18 * * 1-5"  # Daily 6PM SGT
model: gpt-4o
temperature: 0.1
tools:
  - stripe_api (invoice creation)
  - hubspot_api (deal update)
  - gmail_api (reminder emails)
prompt_template: |
  For each completed milestone:
  1. Generate Stripe invoice based on SOW
  2. Send payment reminder at 7 days, 14 days, 21 days
  3. Update HubSpot deal stage
  4. If paid: trigger onboarding workflow (OPS-02)
  5. If overdue >30 days: alert Sam for manual follow-up
output: Invoice + payment status update
next_agent: OPS-02 (onboarding)
sla: Invoice sent within 24 hours of milestone completion
```

### 1.2 Operations Agents

#### OPS-01: Workflow Monitor Agent
```yaml
agent_id: OPS-01
name: "n8n Watchdog"
schedule: "*/5 * * * *"  # Every 5 minutes
model: n/a (rule-based)
tools:
  - n8n_api (workflow status)
  - pagerduty_api (alerting)
  - slack_api (notification)
prompt_template: |
  Check all active n8n workflows:
  - Last execution status: success/failure
  - Error count in last 24h
  - Execution time trend (degradation detection)
  
  If failure_rate > 20%: alert via PagerDuty + Slack
  If execution_time > 2x baseline: alert via Slack
  If all healthy: log "OK" to monitoring dashboard
output: Health status + alerts
sla: 99.5% uptime target
```

#### OPS-02: QA Auto Agent
```yaml
agent_id: OPS-02
name: "Client Automation QA"
schedule: "0 2 * * *"  # Daily 2AM SGT
model: claude-3.5-sonnet
temperature: 0.2
tools:
  - playwright (browser automation testing)
  - hubspot_api (client data)
prompt_template: |
  For each active client automation:
  1. Run end-to-end test (playwright script per workflow)
  2. Check output quality (sample 10 recent outputs)
  3. Verify API integrations still responding
  4. Log pass/fail + anomalies
  
  If fail: create ticket in HubSpot + alert Sam
  If anomaly detected: flag for weekly review
output: QA report per client
sla: All clients tested daily
```

#### OPS-03: Knowledge Base Agent
```yaml
agent_id: OPS-03
name: "Knowledge Curator"
schedule: "0 6 * * 0"  # Weekly Sunday 6AM SGT
model: claude-3.5-sonnet
temperature: 0.3
tools:
  - notion_api (wiki updates)
  - gdrive_api (case study sync)
prompt_template: |
  Weekly knowledge sync:
  1. Pull new case studies from completed projects
  2. Update pricing matrix if market rates changed
  3. Add new client pain points to objection handling doc
  4. Archive outdated workflows/templates
output: Updated Notion wiki
sla: Weekly refresh
```

#### OPS-04: Infrastructure Agent
```yaml
agent_id: OPS-04
name: "DevOps & Security"
schedule: "0 5 * * *"  # Daily 5AM SGT
model: n/a (scripted)
tools:
  - aws_cli (infrastructure)
  - vault_api (secrets rotation)
  - stripe_api (billing check)
prompt_template: |
  Daily infrastructure checks:
  1. Rotate API keys older than 30 days
  2. Backup n8n workflows to S3
  3. Check API token balances (Claude, OpenAI, Instantly)
  4. Verify Stripe payouts + reconcile with accounting
  5. Check for unused resources (stop cost bleed)
  
  If any issue: alert Sam via Slack with priority (high/med/low)
output: Security + cost report
sla: Daily execution
```

### 1.3 Intelligence Agents

#### INT-01: Market Research Agent
```yaml
agent_id: INT-01
name: "Competitive Intelligence"
schedule: "0 7 * * 1"  # Weekly Monday 7AM SGT
model: claude-3.5-sonnet
temperature: 0.5
tools:
  - web_search (competitor scanning)
  - web_scrape (pricing pages)
prompt_template: |
  Scan for:
  1. New AI automation agencies targeting supply chain/SAP
  2. Pricing changes from top 5 competitors
  3. New tools/APIs relevant to our stack
  4. Client vertical trends (which industries hiring AI automation?)
  
  Output: Competitive brief (300 words max) + pricing matrix update
output: Weekly competitive brief
sla: Weekly delivery
```

#### INT-02: Analytics Agent
```yaml
agent_id: INT-02
name: "Revenue Analytics"
schedule: "0 8 * * *"  # Daily 8AM SGT
model: n/a (SQL-based)
tools:
  - postgresql (data warehouse)
  - metabase_api (dashboard)
prompt_template: |
  Daily metrics pull:
  1. Leads generated (yesterday)
  2. Outreach sent, open rate, reply rate
  3. Pipeline value by stage
  4. Revenue (new + recurring)
  5. Agent uptime %
  6. Token spend vs budget
  
  Update Metabase dashboard
  Alert Sam if any metric drops >20% vs 7-day avg
output: Dashboard update + alerts
sla: Daily by 8:30AM SGT
```

#### INT-03: Forecasting Agent
```yaml
agent_id: INT-03
name: "Revenue Forecaster"
schedule: "0 20 * * 0"  # Weekly Sunday 8PM SGT
model: claude-3.5-sonnet
temperature: 0.2
tools:
  - postgresql (historical data)
  - notion_api (forecast doc)
prompt_template: |
  Generate 90-day forecast based on:
  1. Current pipeline (HubSpot deal stages + probabilities)
  2. Historical conversion rates by stage
  3. Seasonality (ASEAN fiscal year, holidays)
  4. Agent capacity constraints
  
  Output: 90-day revenue forecast (low/base/high) + resource needs
output: Forecast doc in Notion
sla: Weekly Sunday delivery
```

#### INT-04: Content Agent
```yaml
agent_id: INT-04
name: "Content Engine"
schedule: "0 10 * * 1,3,5"  # Mon/Wed/Fri 10AM SGT
model: claude-3.5-sonnet
temperature: 0.7
tools:
  - linkedin_api (post scheduling)
  - notion_api (content calendar)
prompt_template: |
  Generate content for next 7 days:
  - 3 LinkedIn posts (supply chain + AI insights)
  - 2 case study snippets (anonymized client wins)
  - 1 outreach email template update
  
  Rules:
  - No AI hype words ("revolutionize", "cutting-edge")
  - Lead with specific metric or client pain point
  - Include clear CTA (comment, DM, Calendly)
  - Keep posts under 150 words
output: Content calendar populated
next_agent: Sam approval gate for first post
sla: Weekly content batch
human_gate: Sam approves first post of each batch
```

---

## 2. AGENT INTERACTION MATRIX

```
REV-01 ──▶ REV-02 ──▶ REV-03 ──▶ [Sam Gate] ──▶ REV-04 ──▶ REV-05
   │           │           │                      │
   │           │           │                      ▼
   │           │           │                 OPS-02 (onboarding)
   │           │           │                      │
   │           │           │                      ▼
   │           │           │                 OPS-01 (monitoring)
   │           │           │                      │
   ▼           ▼           ▼                      ▼
INT-01      INT-02      INT-03                 INT-04
(weekly)    (daily)     (weekly)               (weekly)
   │           │           │                      │
   └───────────┴───────────┴──────────────────────┘
                      │
                      ▼
                 OPS-03 (knowledge)
                 OPS-04 (infra)
```

---

## 3. HUMAN ESCALATION RULES

| Condition | Agent | Action | Sam SLA |
|-----------|-------|--------|---------|
| Proposal ready to send | REV-04 | Pause, Slack Sam | 4 hours |
| Invoice >S$10,000 | REV-05 | Hold, Slack Sam | 24 hours |
| Negative sentiment in reply | REV-03 | Flag, Slack Sam | 4 hours |
| Token spend >S$500/day | OPS-04 | Halt non-critical, Slack Sam | Immediate |
| Workflow failure >20% | OPS-01 | PagerDuty + Slack | Immediate |
| First content batch | INT-04 | Pause, Slack Sam | 24 hours |

---

## 4. AGENT PERFORMANCE DASHBOARD

### Daily Metrics (Sam Review)
- Leads generated: target 50/day
- Emails sent: target 50/day
- Reply rate: target >5%
- Pipeline value: cumulative
- Agent uptime: target >95%
- Token spend: target <S$500/day

### Weekly Metrics (Sam Review)
- Win rate: target 10%
- Avg deal size: target S$2,500+
- Monthly recurring revenue: target S$800+/client
- Client satisfaction: NPS >50
- Agent intervention rate: target <10%

---

*Framework v1.0 — Ready for deployment. All agents configured, tested in staging.*
