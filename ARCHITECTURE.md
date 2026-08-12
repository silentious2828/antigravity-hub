# Project Architecture — AI-Driven Enterprise Transformation
**Document Control ID:** ARCH-MASTER-20260808  
**Operator:** Sam Leong  
**Status:** Production-Ready Scaffold  
**Last Updated:** 2026-08-08

---

## 1. SYSTEM OVERVIEW

### 1.1 Mission
Deliver a zero-employee AI automation agency targeting supply chain / SAP MM decision-makers in ASEAN, backed by a production-ready SaaS product (QAFlow AI), a Google Cloud data-agent toolkit, and a 34-agent career branding engine.

### 1.2 Three Pillars
```
┌─────────────────────────────────────────────────────────────┐
│                    AI ENTERPRISE TRANSFORMATION              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  PILLAR 1       │  │  PILLAR 2       │  │  PILLAR 3  │ │
│  │  Revenue SaaS   │  │  Data Agent Kit │  │  Career    │ │
│  │  (QAFlow AI)    │  │  (GCP Services) │  │  Branding  │ │
│  │                 │  │                 │  │  Engine    │ │
│  │  Next.js        │  │  Python CLI +   │  │            │ │
│  │  Supabase       │  │  GCP clients    │  │  34 agents │ │
│  │  Stripe         │  │                 │  │  CV / DOS  │ │
│  │  n8n            │  │  BQ, Storage,   │  │  Outreach  │ │
│  │                 │  │  Pub/Sub, etc.  │  │  Governance│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. REPOSITORY STRUCTURE

```
my-project/
├── ARCHITECTURE.md                    ← Master architecture (this file)
├── README.md                          ← Project index
├── pyproject.toml                     ← Python package config
├── .github/workflows/                 ← CI for data-agent-kit
│
├── src/data_agent_kit/                ← PILLAR 2: GCP Data Agent Kit
│   ├── __init__.py
│   ├── cli.py                         ← data-agent CLI entrypoint
│   ├── bigquery.py                    ← BigQueryClient
│   ├── storage.py                     ← StorageClient
│   ├── pubsub.py                      ← PubSubClient
│   ├── secret.py                      ← SecretManagerClient
│   └── logging.py                     ← LoggingClient
│
├── ai-enterprise/                     ← PILLAR 1: QAFlow AI SaaS
│   ├── README.md                      ← SaaS master index
│   ├── Zero_Employee_AI_Agent_Architecture.md
│   ├── Launch_Zero_Employee_AI_Enterprise_Playbook.md
│   ├── Technical_Implementation_Guide.md
│   ├── Operational_Framework_Agent_Stack.md
│   ├── One_Page_Offer_AI_Automation_Agency.md
│   ├── Target_List_50_Companies.md
│   ├── .env.local.template
│   ├── app/
│   │   └── api/webhooks/stripe/route.ts
│   ├── outreach/
│   ├── slack/
│   ├── site/
│   └── deliverables/
│
├── career-branding/                   ← PILLAR 3: Career Branding Engine
│   ├── README.md
│   ├── cv/
│   │   ├── CV_1_Maersk_Regional_Head_Chartering.md
│   │   ├── CV_2_Maersk_Operational_Excellence.md
│   │   ├── CV_3_Google_Cloud_APAC_Strategic_Engagement.md
│   │   ├── CV_4_TikTok_Eco_Project_Manager.md
│   │   └── CV_5_AWS_Principal_Partner_Development_AI.md
│   ├── cover-letters/
│   │   ├── Cover_Letter_Master_Sam_Leong.md
│   │   ├── Cover_Letter_Variant_A_Global_Distribution.md
│   │   ├── Cover_Letter_Variant_B_Enterprise_AI.md
│   │   └── Cover_Letter_Variant_C_SAP_MM.md
│   ├── dossiers/
│   │   └── Executive_Dossier_Sam_Leong.md
│   ├── linkedin/
│   │   ├── LinkedIn_Headline_About.md
│   │   └── LinkedIn_Posts_Week1-2.md
│   ├── application-packages/
│   │   ├── Application_Package_AWS.md
│   │   ├── Application_Package_Google_Cloud.md
│   │   ├── Application_Package_Maersk.md
│   │   ├── Application_Package_Stamford_Tyres.md
│   │   └── Application_Package_TikTok.md
│   └── supporting/
│       ├── Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.md
│       ├── Boardroom_Deck_Outline.md
│       ├── Interview_Playbook.md
│       ├── Negotiation_Matrix.md
│       └── Master_Portfolio_Binder_Sam_Leong.md
│
├── tier1-core-assets/                 ← Career Branding Agents (Tier 1)
│   ├── cv-agent-spec.md
│   ├── cover-letter-agent-spec.md
│   ├── executive-dossier-agent-spec.md
│   ├── podcast-agent-spec.md
│   └── final-goals-agent-spec.md
│
├── tier2-metrics/                     ← Metrics & Analytics Agents (Tier 2)
│   ├── analytics-dashboard-agent-spec.md
│   ├── 90day-plan-agent-spec.md
│   ├── risk-mitigation-agent-spec.md
│   ├── success-metrics-agent-spec.md
│   └── review-cadence-agent-spec.md
│
├── tier3-outreach/                    ← Outreach & Visibility Agents (Tier 3)
│   ├── email-outreach-agent-spec.md
│   ├── linkedin-profile-agent-spec.md
│   ├── linkedin-posts-agent-spec.md
│   ├── linkedin-articles-agent-spec.md
│   ├── podcast-platform-agent-spec.md
│   └── website-agent-spec.md
│
├── tier4-governance/                  ← Governance & Control Agents (Tier 4)
│   ├── governance-roles-agent-spec.md
│   ├── versioning-agent-spec.md
│   ├── versioning-policy.md
│   ├── change-log-agent-spec.md
│   ├── change-log-schema.md
│   └── rewrite-governance-agent-spec.md
│   └── rewrite-governance-policy.md
│
├── tier5-supporting/                  ← Supporting Agents (Tier 5)
│   ├── boardroom-deck-agent-spec.md
│   ├── content-authority-agent-spec.md
│   ├── positioning-lock-agent-spec.md
│   ├── executive-search-interface-agent-spec.md
│   ├── referral-system-agent-spec.md
│   ├── compensation-leverage-agent-spec.md
│   ├── network-architecture-agent-spec.md
│   ├── opportunity-filter-agent-spec.md
│   ├── testimonial-agent-spec.md
│   ├── narrative-mastery-agent-spec.md
│   ├── opportunity-flow-agent-spec.md
│   ├── negotiation-agent-spec.md
│   └── succession-legacy-agent-spec.md
│
├── agent-specs/                       ← Enterprise Transformation Agents
│   ├── README.md
│   ├── revenue-agents/
│   │   ├── rev-01-lead-research.md
│   │   ├── rev-02-cold-outreach.md
│   │   ├── rev-03-lead-qualification.md
│   │   ├── rev-04-proposal-generator.md
│   │   └── rev-05-invoice-collections.md
│   ├── operations-agents/
│   │   ├── ops-01-workflow-monitor.md
│   │   ├── ops-02-qa-auto.md
│   │   ├── ops-03-knowledge-base.md
│   │   └── ops-04-infrastructure.md
│   └── intelligence-agents/
│       ├── int-01-market-research.md
│       ├── int-02-analytics.md
│       ├── int-03-forecasting.md
│       └── int-04-content.md
│
├── docs/                              ← Supporting documentation
│   ├── chapter-career-branding-final-goals.md
│   ├── Cover_Letter_Master_Sam_Leong.md
│   ├── Executive_Dossier_Gemini_AI.md
│   └── Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.md
│
├── registry/
│   └── omniroute-master-registry-gemini-merged.json
│
├── tests/                             ← Python package tests
│   ├── test_greeter.py
│   ├── test_storage.py
│   └── test_integration.py
│
├── backups/                           ← Versioned zip archives
├── notebooks/                         ← Jupyter notebooks
├── image/                             ← Media assets
├── audio/                             ← Podcast audio
└── archive/                           ← Archived superseded assets
```

---

## 3. PILLAR 1 — QAFlow AI SaaS (Revenue Engine)

### 3.1 Product Definition
**Name:** QAFlow AI  
**Tagline:** Automate QA reports, defect tracking, and compliance documentation with AI.  
**Vertical:** Supply chain / manufacturing quality assurance  
**Pricing:**
- Starter: $49/month (20 reports, basic templates)
- Pro: $149/month (unlimited, SAP/Excel import, team seats)
- Launch Offer: $79/month (first 10 customers, lifetime grandfathered)

### 3.2 Tech Stack
| Layer | Tool | Purpose |
|-------|------|---------|
| Frontend | Next.js 14+ (App Router), Tailwind, shadcn/ui | Web app |
| Backend | Supabase (PostgreSQL, RLS, pgvector, Storage) | Data + Auth |
| Auth | Clerk / Supabase Auth | User management |
| AI Router | OpenRouter / Direct SDKs (OpenAI, DeepSeek, Groq, Claude) | LLM orchestration |
| Billing | Stripe Billing | Subscriptions, metered billing, webhooks |
| Automation | n8n / Make.com | Workflow orchestration |
| Email | Resend / Loops.so | Transactional email |

### 3.3 Database Schema (Supabase / PostgreSQL)
```sql
-- Users and Subscription Profile
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'free',
    subscription_plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Generation Records & Token Audit
CREATE TABLE public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    output_content TEXT NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    tokens_consumed INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users view own generations" ON public.generations FOR SELECT USING (auth.uid() = user_id);
```

### 3.4 Core API Routes
- `POST /api/generate` — AI generation with usage-limit enforcement
- `POST /api/webhooks/stripe` — Subscription event handler

---

## 4. PILLAR 2 — Data Agent Kit (GCP Infrastructure)

### 4.1 Package Definition
**Name:** `data-agent-kit`  
**Version:** 0.1.0  
**Entrypoint:** `.venv/bin/data-agent`  
**Python:** >=3.10

### 4.2 GCP Service Modules
| Module | Class | Purpose |
|--------|-------|---------|
| `bigquery.py` | `BigQueryClient` | Run SQL queries against BigQuery |
| `storage.py` | `StorageClient` | List/manage Cloud Storage buckets |
| `pubsub.py` | `PubSubClient` | List Pub/Sub topics |
| `secret.py` | `SecretManagerClient` | Access/list secrets |
| `logging.py` | `LoggingClient` | Query Cloud Logging entries |

### 4.3 CLI Commands
```bash
data-agent bigquery "SELECT * FROM dataset.table"
data-agent storage
data-agent pubsub
data-agent secret --access <secret-id>
data-agent logs --filter "severity=ERROR" --max-entries 20
```

### 4.4 Optional Dependencies (Extras Groups)
```toml
gcp = ["google-cloud-bigquery", "google-cloud-storage", "google-cloud-logging", "google-cloud-pubsub", "google-cloud-secret-manager"]
bigquery = ["google-cloud-bigquery"]
storage = ["google-cloud-storage"]
logging = ["google-cloud-logging"]
pubsub = ["google-cloud-pubsub"]
secret = ["google-cloud-secret-manager"]
```

### 4.5 Testing
```bash
.venv/bin/pytest tests -v
# Integration tests require GCP auth: gcloud init
```

---

## 5. PILLAR 3 — Career Branding Engine (34-Agent System)

### 5.1 Agent Tier Map
| Tier | Focus | Agent Count | Status |
|------|-------|-------------|--------|
| Tier 1 | Core Assets (CV, Cover Letter, Dossier, Podcast, Final Goals) | 5 | 🟢 LOCKED |
| Tier 2 | Metrics & Analytics (Dashboard, 90-Day Plan, Risk, Success Metrics, Review Cadence) | 5 | 🟢 ACTIVE |
| Tier 3 | Outreach & Visibility (Email, LinkedIn Profile/Posts/Articles, Podcast Platform, Website) | 6 | 🟢 ACTIVE |
| Tier 4 | Governance & Control (Roles, Versioning, Change Log, Rewrite Policy) | 5 | 🟢 ENFORCED |
| Tier 5 | Supporting (Boardroom Deck, Content Authority, Positioning, Executive Search, Referral, Compensation, Network, Opportunity Filter, Testimonial, Narrative Mastery, Opportunity Flow, Negotiation, Succession Legacy) | 13 | 🟢 ALIGNED |

### 5.2 Brand Positioning
**Headline:** Global Business & Export Leader | 31 Yrs Ops | SAP MM Certified | Enterprise AI & Supply Chain Transformation  
**Tagline:** I don't sell AI. I sell 30% fewer manual hours in your supply chain — guaranteed.

### 5.3 Proof Points
1. 30% QA efficiency gain — NCS Group / MINDEF-RSAF (AI agent automation)
2. 35% PMO cycle reduction — NCS Group (workflow automation)
3. 15% fleet downtime reduction — Digital Bridgestone (SAP MM + predictive maintenance)
4. $2M+ export growth — Global Link Automobile (120+ monthly shipments, 8 markets)
5. 25% dealer network expansion — Global Link Automobile
6. 18% YoY revenue growth — Yu Luo Trading
7. SAP MM Certified (Credential ID: dvi26arefp9n)
8. PSM I & II — Certified Scrum Master
9. 31 years total experience (1995–2026)

---

## 6. ENTERPRISE AGENT STACK (AI Automation Agency)

### 6.1 Revenue Agents (5)
| Agent ID | Role | Schedule | Output |
|----------|------|----------|--------|
| REV-01 | Lead Research Agent | Daily 8AM SGT | 50 qualified leads/day |
| REV-02 | Cold Outreach Agent | Daily 9AM SGT | 50 emails sent |
| REV-03 | Lead Qualification Agent | Real-time | Hot/Warm/Cold tiers |
| REV-04 | Proposal Generator Agent | On hot lead | PDF proposal + Calendly |
| REV-05 | Invoice & Collections Agent | Daily 6PM SGT | Paid invoice → accounting |

### 6.2 Operations Agents (4)
| Agent ID | Role | Schedule | Output |
|----------|------|----------|--------|
| OPS-01 | Workflow Monitor Agent | Every 5 min | Health + alerts |
| OPS-02 | QA Auto Agent | Daily 2AM SGT | Pass/Fail report |
| OPS-03 | Knowledge Base Agent | Weekly Sunday | Updated knowledge base |
| OPS-04 | Infrastructure Agent | Daily 5AM SGT | Security + cost report |

### 6.3 Intelligence Agents (4)
| Agent ID | Role | Schedule | Output |
|----------|------|----------|--------|
| INT-01 | Market Research Agent | Weekly Monday | Competitive brief |
| INT-02 | Analytics Agent | Daily 8AM SGT | Dashboard update |
| INT-03 | Forecasting Agent | Weekly Sunday | 90-day forecast |
| INT-04 | Content Agent | Mon/Wed/Fri 10AM | Content calendar |

### 6.4 Tool Stack
| Layer | Tool | Cost (2026) |
|-------|------|-------------|
| Workflow | n8n / Make | S$0–50/mo |
| AI Brain | Claude API / OpenAI | S$200–500/mo |
| Outreach | Instantly / Apollo | S$30–100/mo |
| CRM | HubSpot | S$0–50/mo |
| Billing | Stripe | 2.9% + S$0.50/txn |
| Monitoring | Slack + PagerDuty | S$0–30/mo |
| Knowledge | Notion | S$8–15/mo |
| Hosting | AWS/VPS | S$20–50/mo |
| **Total** | | **S$300–800/mo** |

---

## 7. OPERATIONAL MODES

### 7.1 Autonomous Mode (No Human Required)
- Lead scoring (REV-03)
- Invoice generation (REV-05)
- Workflow monitoring (OPS-01)
- Analytics reporting (INT-02)
- Daily infrastructure checks (OPS-04)

**Guardrails:**
- All actions logged to immutable audit trail
- Token budget limits per agent per day
- Automatic circuit-breaker on API failure

### 7.2 Human-in-the-Loop Mode (Fast Approval Required)
- Proposal generation (REV-04) → Sam reviews before send
- Cold outreach copy → Sam approves first 10
- Client onboarding → Sam signs off on scope
- Pricing exceptions → Sam approves discount >10%

**SLA:** Sam notified via Slack, 4-hour max response time.

### 7.3 Strategic Mode (Weekly Review)
- Weekly forecast review (INT-03)
- Competitor brief (INT-01)
- Pipeline health check
- Agent performance review

**Cadence:** Sam reviews every Sunday 20:00 SGT, 30-minute max review.

---

## 8. DEPLOYMENT CHECKLIST

### Day 1: Infrastructure
- [ ] Provision n8n instance (self-hosted or cloud)
- [ ] Set up Claude API account + billing
- [ ] Create Instantly account + warm-up domain
- [ ] Set up HubSpot CRM (free tier)
- [ ] Configure Stripe account

### Day 2: Agent Core
- [ ] Deploy REV-01 (Lead Research) with target list criteria
- [ ] Deploy REV-02 (Cold Outreach) with email templates
- [ ] Deploy REV-03 (Lead Qualification) with scoring model
- [ ] Set up Slack alerts for human-in-the-loop gates

### Day 3: Intelligence Layer
- [ ] Deploy INT-01 (Market Research) weekly scan
- [ ] Deploy INT-02 (Analytics) daily dashboard sync

### Day 4: Operations Layer
- [ ] Deploy OPS-01 (Workflow Monitor)
- [ ] Deploy OPS-04 (Infrastructure/Key Rotation)
- [ ] Test circuit-breaker and retry logic

### Day 5: Go Live
- [ ] Sam approves first 10 outreach emails manually
- [ ] Launch first lead batch (50 leads)
- [ ] Monitor agent logs for 24 hours

---

## 9. SCALING PATH

| Phase | Duration | Operator | Agents | Target Revenue |
|-------|----------|----------|--------|----------------|
| Solo | Months 1–3 | Sam only | REV-01–05 | S$5–10K/mo |
| Light Automation | Months 4–6 | Sam + 1 contractor | All 13 | S$15–25K/mo |
| Full Autonomy | Months 7–12 | Sam + 2 contractors | Full autonomy | S$30–50K/mo |
| Productized SaaS | Month 12+ | Sam + small team | Hybrid | S$50–100K/mo |

---

## 10. SUCCESS METRICS

| Metric | Month 1 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Leads generated/day | 50 | 100 | 200 |
| Outreach emails/day | 50 | 100 | 200 |
| Reply rate | 5% | 8% | 10% |
| Win rate | 10% | 15% | 20% |
| Avg deal size | S$2,500 | S$3,500 | S$5,000 |
| Monthly revenue | S$5K | S$20K | S$40K |
| Agent uptime | 95% | 98% | 99.5% |
| Human intervention rate | 20% | 10% | 5% |

---

## 11. SECURITY & COMPLIANCE

### 11.1 Data Handling
- All client data encrypted at rest (AES-256)
- API keys rotated every 30 days (OPS-04)
- PII scrubbed from agent logs before storage
- No client data used for model training

### 11.2 Access Control
| Role | Access |
|------|--------|
| Sam (Human) | Full admin, override any agent |
| OPS-01 (Monitor) | Read-only workflow access |
| All agents | Scoped API tokens only |

### 11.3 Audit Trail
- Every agent action logged to immutable store
- Daily summary emailed to Sam
- 90-day retention minimum
- Replay capability for debugging

---

## 12. RISK MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| API rate limits | Medium | High | Token budget caps, fallback providers |
| Email deliverability | Medium | High | Warm-up domain, monitor spam score |
| Agent hallucination | Low | Medium | Human-in-the-loop for outbound copy |
| Client churn | Medium | High | Outcome-based pricing, monthly value reports |
| Model drift | Low | Medium | Weekly retraining, prompt versioning |

---

## 13. GOVERNANCE

### 13.1 Career Branding Governance
- Rewrite Policy: `tier4-governance/rewrite-governance-policy.md`
- Change Log Schema: `tier4-governance/change-log-schema.md`
- Versioning Policy: `tier4-governance/versioning-policy.md`
- 8-Step Controlled Rewrite Engine enforced on all core assets

### 13.2 Dual-Track Deployment
- **Track A:** Copilot ATS CV (v2.4-ST) — Workday/ATS optimized
- **Track B:** Gemini Executive Dossier — C-Suite/Board deep-dive

---

## 14. CHECKPOINTS

| ID | Status | Description |
|----|--------|-------------|
| CP-001 | ✅ COMPLETED | Dual-Track CV Suite (v2.4-ST) |
| CP-002 | ✅ COMPLETED | Cover Letter Master + 3 Variants |
| CP-003 | ✅ COMPLETED | Podcast EP-12 produced |
| CP-004 | ✅ COMPLETED | Stamford Tyres Application Submitted |
| CP-005 | ✅ COMPLETED | LinkedIn 1,000+ Connections |
| CP-006 | ✅ COMPLETED | 34-Agent System Deployed |
| CP-007 | 🟡 IN PROGRESS | SIT Digital Supply Chain Programme |
| CP-008 | ⏳ PENDING | AIAP Application Submission |
| CP-009 | 🟡 IN PROGRESS | Bi-Weekly Content Cadence |
| CP-010 | 🟡 IN PROGRESS | Recruiter Conversion Protocol |
| CP-011 | ⏳ PENDING | Q1 Quarterly Review (2026-11-26) |

---

*Architecture v1.0 — Production-ready scaffold. All three pillars operational and sovereignly locked.*
