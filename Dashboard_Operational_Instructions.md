# Master Career Branding Dashboard — Operational Instructions
**System:** RAIN-CAG 34 Master Career Branding Project  
**Document Control ID:** ARCH-SPEC-RAIN34-20260806  
**Archive Lock ID:** ARCHIVE-20260826-001  
**Version:** v1.0  
**Status:** 🟢 LIVE & OPERATIONAL  
**Primary Architect:** Sam Leong

---

## 1. Dashboard Overview

The Master Career Branding Dashboard is the central command interface for the RAIN-CAG 34 system. It provides real-time visibility into all 34 agents across 5 tiers, tracks application status, monitors KPIs, and enforces governance policies.

### Dashboard Access
- **Local:** Open `Master_Portfolio_Binder_Sam_Leong.md` or `notebooks/Master_Career_Branding_Notebook.ipynb`
- **Registry:** `registry/omniroute-master-registry-gemini-merged.json`
- **Change Log:** `CHANGE_LOG.md`
- **Governance Policy:** `tier4-governance/rewrite-governance-policy.md`

---

## 2. System Architecture — 34-Agent Count & Tiers

| Tier | Name | Agent Count | Status | Primary Function |
|------|------|-------------|--------|------------------|
| **Tier 1** | Core Assets | **5 agents** | 🟢 LOCKED | CV, Cover Letters, Podcast, Dossier, Final Goals |
| **Tier 2** | Metrics & Analytics | **5 agents** | 🟢 ACTIVE | KPI tracking, 90-Day Plan, Risk, Reviews, Analytics |
| **Tier 3** | Outreach & Visibility | **6 agents** | 🟢 ACTIVE | LinkedIn, Posts, Articles, Website, Email, Podcast |
| **Tier 4** | Governance & Control | **5 agents** | 🟢 ENFORCED | Rewrite, Versioning, Change Log, Notifications, Roles |
| **Tier 5** | Supporting | **13 agents** | 🟢 ALIGNED | Positioning, Content, Network, Opportunity, Narrative, Referral, Testimonial, Negotiation, Opportunity Flow, Compensation, Executive Search, Boardroom, Succession |
| **Total** | | **34 agents** | | |

---

## 3. Tier 1 — Core Assets (5 Agents)

### T1-01: CV Agent
**File:** `tier1-core-assets/cv-agent-spec.md`  
**Version:** v2.4-ST  
**Status:** 🟢 LOCKED  
**Owned Files:**
- `Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.md` (primary)
- `CV_1_Maersk_Regional_Head_Chartering.md`
- `CV_2_Maersk_Operational_Excellence.md`
- `CV_3_Google_Cloud_APAC_Strategic_Engagement.md`
- `CV_4_TikTok_Eco_Project_Manager.md`
- `CV_5_AWS_Principal_Partner_Development_AI.md`

**How to Use:**
1. Open the primary CV for Stamford Tyres applications
2. Use `CV_1` or `CV_2` for Maersk applications
3. Use `CV_3` for Google Cloud
4. Use `CV_4` for TikTok
5. Use `CV_5` for AWS
6. Any edit requires 8-step rewrite governance (see Tier 4)

### T1-02: Cover Letter Agent
**File:** `tier1-core-assets/cover-letter-agent-spec.md`  
**Version:** v1.0  
**Status:** 🟢 LOCKED  
**Owned Files:**
- `Cover_Letter_Master_Sam_Leong.md`
- `Cover_Letter_Variant_A_Global_Distribution.md`
- `Cover_Letter_Variant_B_Enterprise_AI.md`
- `Cover_Letter_Variant_C_SAP_MM.md`
- `CoverLetter_working/CoverLetter_draft_2026-08-05/` (4 working drafts)

**How to Use:**
1. Master Cover Letter — generic applications, AIAP, SCTP
2. Variant A — Stamford Tyres / Global Distribution roles
3. Variant B — Enterprise AI / Google Cloud / AWS AI roles
4. Variant C — SAP MM / ERP Modernization roles

### T1-03: Podcast Agent
**File:** `tier1-core-assets/podcast-agent-spec.md`  
**Version:** v1.0  
**Status:** 🟢 LOCKED  
**Owned Files:**
- `audio/Podcast_Transcript_Final_Goals.md`

**How to Use:**
- Reference EP-12 transcript for content ideas
- Use in LinkedIn posts, articles, and website bio
- Quarterly recirculation schedule

### T1-04: Executive Dossier Agent
**File:** `tier1-core-assets/executive-dossier-agent-spec.md`  
**Version:** v1.0  
**Status:** 🟢 LOCKED  
**Owned Files:**
- `docs/Executive_Dossier_Gemini_AI.md`
- `archive/ARCHIVE-20260826-001/Executive_Dossier_Gemini_AI.md`

**How to Use:**
- Submit to C-suite / board-level applications
- Pair with CV for executive search firm submissions
- Keep 100% sync with CV dates and certifications

### T1-05: Final Goals Agent
**File:** `tier1-core-assets/final-goals-agent-spec.md`  
**Version:** v1.0  
**Status:** 🟢 LOCKED  
**Owned Files:**
- `docs/chapter-career-branding-final-goals.md`
- `archive/ARCHIVE-20260826-001/chapter-career-branding-final-goals_ARCHIVE-20260826-001.md`

**How to Use:**
- Reference for 90-day planning
- Use metrics table for KPI targets
- Align with Tier 2 agents for tracking

---

## 4. Tier 2 — Metrics & Analytics (5 Agents)

### T2-01: Success Metrics Agent
**File:** `tier2-metrics/success-metrics-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**KPIs Tracked:**
- LinkedIn profile views
- Search appearances
- Inbound recruiter inquiries
- Compensation floor adherence (S$120K–S$144K+)
- ATS match rate (target ≥95%)
- Application conversion rate (target ≥15%)

**How to Use:**
- Update weekly in Master Portfolio Binder metrics table
- Feed data to Analytics Dashboard Agent (T2-05)
- Alert Risk Mitigation Agent (T2-03) on threshold breaches

### T2-02: 90-Day Plan Agent
**File:** `tier2-metrics/90day-plan-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Phases:**
- Weeks 1–4: Audit & Baseline
- Weeks 5–8: Foundation Build
- Weeks 9–12: Amplify & Optimize

**How to Use:**
- Track weekly milestones in CHANGE_LOG.md
- Cross-reference with Review Cadence Agent (T2-04)
- Escalate slippage to Risk Mitigation Agent (T2-03)

### T2-03: Risk Mitigation Agent
**File:** `tier2-metrics/risk-mitigation-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Risk Thresholds:**
- Posting gaps > 2 weeks
- Low engagement < 3%
- Shallow network (Inner layer < 5)
- ATS match rate < 85%
- Application conversion < 15%

**How to Use:**
- Monitor weekly for threshold breaches
- Escalate to Governance Agent (T4-01) on critical thresholds
- Report monthly to Risk Matrix Agent (T5-09)

### T2-04: Review Cadence Agent
**File:** `tier2-metrics/review-cadence-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Schedule:**
- Weekly: Friday 17:00 SGT
- Monthly: Last business day
- Quarterly: 2026-11-26
- Annual: Year-end

**How to Use:**
- Schedule reviews in calendar
- Collect tier status reports
- Archive outcomes in CHANGE_LOG.md

### T2-05: Analytics Dashboard Agent
**File:** `tier2-metrics/analytics-dashboard-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Sections:**
- KPI Progress Bars
- Growth Rates
- Compensation Floor Tracking
- ATS Match Rate Trend
- Tier Status Grid

**How to Use:**
- Update from T2-01, T2-02, T2-03, T2-04 data
- View in Master Portfolio Binder or notebook
- Real-time override capability for executive review

---

## 5. Tier 3 — Outreach & Visibility (6 Agents)

### T3-01: LinkedIn Profile Agent
**File:** `tier3-outreach/linkedin-profile-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Owned Assets:**
- LinkedIn headline (≤220 chars)
- LinkedIn about/summary
- Featured section links

**How to Use:**
- Update quarterly or after role pivot
- Sync with Website Agent (T3-04) featured links
- Enforce mobile readability

### T3-02: LinkedIn Posts Agent
**File:** `tier3-outreach/linkedin-posts-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Cadence:** 2×/week (Tuesday, Thursday)  
**Content Pillars:**
- ERP Modernization (SAP MM, supply chain)
- Enterprise AI adoption
- Career branding insights

**How to Use:**
- Draft posts in advance
- Use Content Authority Agent (T5-02) calendar
- Include video waveform clips for engagement

### T3-03: LinkedIn Articles Agent
**File:** `tier3-outreach/linkedin-articles-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Cadence:** Quarterly  
**Length:** 1,500–2,500 words

**How to Use:**
- Expand LinkedIn Posts topics into long-form
- Cross-publish to Substack and website
- Schedule quarterly in content calendar

### T3-04: Website Agent
**File:** `tier3-outreach/website-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Owned Assets:**
- Web bio (<250 chars)
- CV download page (all variants)
- Podcast player embed
- Executive Dossier page

**How to Use:**
- Keep bio aligned with positioning lock
- Host all 6 CV variants for download
- Embed podcast player (EP-12)

### T3-05: Email Outreach Agent
**File:** `tier3-outreach/email-outreach-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Templates:**
- Template 1: Direct application follow-up
- Template 2: Executive search firm engagement
- Template 3: Warm referral conversion

**How to Use:**
- Respond within <12 hours SLA
- Personalize token fields per target
- A/B test templates; log results in CHANGE_LOG.md

### T3-06: Podcast Platform Agent
**File:** `tier3-outreach/podcast-platform-agent-spec.md`  
**Status:** 🟢 ACTIVE  
**Platforms:** Spotify, Apple Podcasts, YouTube, LinkedIn

**How to Use:**
- Maintain RSS feed
- Optimize tags for discoverability
- Schedule quarterly recirculation

---

## 6. Tier 4 — Governance & Control (5 Agents)

### T4-01: Rewrite Governance Agent
**File:** `tier4-governance/rewrite-governance-agent-spec.md`  
**Status:** 🟢 ENFORCED  
**Policy:** `tier4-governance/rewrite-governance-policy.md`

**Rewrite Triggers (any one validates):**
1. KPI Deficit — Conversion < 15% / ATS Match < 75%
2. Role Shift — Target scope pivot
3. Major Achievement — New board position / award
4. Market Signal — Recruiter feedback > 5 contacts
5. Strategic Pivot — Geographic or sector realignment

**Mandatory 8-Step Process:**
1. Trigger Audit
2. Change Logging (JSON Schema)
3. Staging Branching (vX.Y-draft)
4. Drafting Edit
5. ATS Scan Gate (≥85% Match)
6. Cross-Sync Check (Dossier/CV)
7. Rollback Backup Zip Creation
8. Deploy & Lock

**How to Use:**
- NO edits to Tier 1 assets bypass this process
- All changes logged to CHANGE_LOG.md
- Rollback backups in `backups/`

### T4-02: Versioning Agent
**File:** `tier4-governance/versioning-agent-spec.md`  
**Status:** 🟢 ENFORCED  
**Policy:** `tier4-governance/versioning-policy.md`

**Versioning Rules:**
- MAJOR: Role vector shift or complete rebrand
- MINOR: Section rewrite or new variant
- PATCH: Typo, date, metric correction
- `-ST` suffix: Stable/locked
- `-draft` suffix: Work in progress

**How to Use:**
- Apply semantic versioning to all asset updates
- Generate backup zip before deployment
- Update registry version field after lock

### T4-03: Change Log Agent
**File:** `tier4-governance/change-log-agent-spec.md`  
**Status:** 🟢 ENFORCED  
**Schema:** `tier4-governance/change-log-schema.md`  
**File:** `CHANGE_LOG.md`

**How to Use:**
- Log every change request with JSON schema
- Status values: `STAGING_ACTIVE`, `DEPLOYED`, `REJECTED`
- Timestamp in ISO8601 with SGT offset

### T4-04: Stakeholder Notification Agent
**File:** `tier4-governance/stakeholder-notification-agent-spec.md`  
**Status:** 🟢 ENFORCED  
**Endpoints:**
- Email: silentious@outlook.com
- LinkedIn: https://linkedin.com/in/samleong2828/
- System: registry JSON

**How to Use:**
- Send activation confirmations on deployment
- Notify on rewrite approval/rejection
- Alert on overdue reviews

### T4-05: Governance Roles Agent
**File:** `tier4-governance/governance-roles-agent-spec.md`  
**Status:** 🟢 ENFORCED

**Role Matrix:**
| Role | Name | Authority |
|------|------|-----------|
| Primary Architect | Sam Leong | Full control, rewrite approval, version lock |
| Governance Reviewer | TBD | Policy compliance, audit sign-off |
| Metrics Steward | TBD | KPI dashboard, data integrity |
| Outreach Lead | TBD | LinkedIn, email, content calendar |
| Compliance Auditor | TBD | Daily log verification, checkpoint validation |

**How to Use:**
- Lock Sam Leong as Primary Architect
- Escalate unauthorized access attempts
- Notify on role changes via T4-04

---

## 7. Tier 5 — Supporting Agents (13 Agents)

| ID | Agent | Version | File | Status |
|----|-------|---------|------|--------|
| T5-01 | Positioning Lock Agent | v2.0 | `tier5-supporting/positioning-lock-agent-spec.md` | 🟢 ALIGNED |
| T5-02 | Content Authority Agent | v2.0 | `tier5-supporting/content-authority-agent-spec.md` | 🟢 ALIGNED |
| T5-03 | Network Architecture Agent | v1.5 | `tier5-supporting/network-architecture-agent-spec.md` | 🟢 ALIGNED |
| T5-04 | Opportunity Filter Agent | v1.5 | `tier5-supporting/opportunity-filter-agent-spec.md` | 🟢 ALIGNED |
| T5-05 | Narrative Mastery Agent | v2.0 | `tier5-supporting/narrative-mastery-agent-spec.md` | 🟢 ALIGNED |
| T5-06 | Referral System Agent | v1.0 | `tier5-supporting/referral-system-agent-spec.md` | 🟢 ALIGNED |
| T5-07 | Testimonial Agent | v1.0 | `tier5-supporting/testimonial-agent-spec.md` | 🟢 ALIGNED |
| T5-08 | Negotiation Agent | v1.5 | `tier5-supporting/negotiation-agent-spec.md` | 🟢 ALIGNED |
| T5-09 | Opportunity Flow Agent | v1.0 | `tier5-supporting/opportunity-flow-agent-spec.md` | 🟢 ALIGNED |
| T5-10 | Compensation Leverage Agent | v1.0 | `tier5-supporting/compensation-leverage-agent-spec.md` | 🟢 ALIGNED |
| T5-11 | Executive Search Interface Agent | v1.0 | `tier5-supporting/executive-search-interface-agent-spec.md` | 🟢 ALIGNED |
| T5-12 | Boardroom Deck Agent | v1.0 | `tier5-supporting/boardroom-deck-agent-spec.md` | 🟢 ALIGNED |
| T5-13 | Succession & Legacy Agent | v1.0 | `tier5-supporting/succession-legacy-agent-spec.md` | 🟢 ALIGNED |

**How to Use:**
- Each agent operates independently but reports to relevant tier leads
- T5-01 (Positioning Lock) is the messaging gatekeeper — all public content must align
- T5-05 (Narrative Mastery) maintains interview playbooks — rehearse before interviews
- T5-09 (Opportunity Flow) tracks 72-hour SLA on all applications
- T5-10 (Compensation Leverage) benchmarks offers against S$120K–S$144K+ floor

---

## 8. Master Checkpoint Ledger

| ID | Category | Milestone | Status | Verification |
|----|----------|-----------|--------|--------------|
| CP-001 | Core Assets | Dual-Track CV Suite (v2.4-ST) | ✅ COMPLETED | `Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.md` |
| CP-002 | Core Assets | Cover Letter Master + 3 Variants | ✅ COMPLETED | `Cover_Letter_Master_Sam_Leong.md` |
| CP-003 | Core Assets | Podcast EP-12 produced | ✅ COMPLETED | `audio/Podcast_Transcript_Final_Goals.md` |
| CP-004 | Outreach | Stamford Tyres Application Submitted | ✅ COMPLETED | Application portal log |
| CP-005 | Network | LinkedIn 1,000+ Connections | ✅ COMPLETED | LinkedIn analytics |
| CP-006 | Governance | 34-Agent System Deployed | ✅ COMPLETED | `registry/omniroute-master-registry-gemini-merged.json` |
| CP-007 | Education | SIT Digital Supply Chain Programme | 🟡 IN PROGRESS | Active / Q3 2026 |
| CP-008 | Career | AIAP Application Submission | ⏳ PENDING | Scheduled |
| CP-009 | Content | Bi-Weekly LinkedIn & Substack Cadence | 🟡 IN PROGRESS | Weeks 1–12 active |
| CP-010 | Recruiter | Recruiter Conversion Protocol (<12hr SLA) | 🟡 IN PROGRESS | Templates ready |
| CP-011 | Governance | Q1 Quarterly Review & Telemetry Audit | ⏳ PENDING | 2026-11-26 |

**How to Use:**
- Update status weekly during Review Cadence Agent cycle
- Mark COMPLETED only after verification reference is confirmed
- Escalate PENDING items to Risk Mitigation Agent (T2-03) if overdue

---

## 9. Step-by-Step Deployment Workflow

### Step 1: Select Target Role
- Review `Application_Package_*.md` files
- Choose CV variant and cover letter for target
- Check Opportunity Filter criteria (S$120K+ floor, APAC scope)

### Step 2: Prepare Application Materials
- Open CV file and review for role-specific keywords
- Open cover letter variant and personalize
- Attach Executive Dossier if C-suite target

### Step 3: Governance Check
- Verify CV version is locked (no `-draft` suffix unless in staging)
- Confirm ATS match score ≥95%
- Log deployment in CHANGE_LOG.md

### Step 4: Submit Application
- Use email template from Email Outreach Agent (T3-05)
- Track in Opportunity Flow Agent (T5-09) with 72-hour SLA
- Log submission timestamp and target

### Step 5: Follow-Up
- Schedule follow-up per Review Cadence Agent (T2-04)
- Update Success Metrics Agent (T2-01) on response
- Escalate to Negotiation Agent (T5-08) on offer receipt

---

## 10. File Structure Reference

```
my-project/
├── Master_Portfolio_Binder_Sam_Leong.md      ← Unified executive binder
├── CHANGE_LOG.md                              ← JSON change log
├── Application_Package_Stamford_Tyres.md      ← Recruiter-ready packets
├── Application_Package_Maersk.md
├── Application_Package_Google_Cloud.md
├── Application_Package_TikTok.md
├── Application_Package_AWS.md
├── Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.md
├── Cover_Letter_Master_Sam_Leong.md
├── Cover_Letter_Variant_A_Global_Distribution.md
├── Cover_Letter_Variant_B_Enterprise_AI.md
├── Cover_Letter_Variant_C_SAP_MM.md
├── Executive_Dossier_Sam_Leong.md
├── chapter-career-branding-final-goals.md
├── CV_1..5_*.md                               ← 5 role-specific CVs
├── docs/                                      ← Working documents
│   ├── Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.md
│   ├── Cover_Letter_Master_Sam_Leong.md
│   ├── Executive_Dossier_Gemini_AI.md
│   └── chapter-career-branding-final-goals.md
├── CoverLetter_working/                       ← Draft working copies
│   └── CoverLetter_draft_2026-08-05/
├── audio/
│   └── Podcast_Transcript_Final_Goals.md
├── archive/ARCHIVE-20260826-001/              ← Baseline copies
├── registry/
│   └── omniroute-master-registry-gemini-merged.json
├── tier1-core-assets/                         ← 5 agent specs
├── tier2-metrics/                             ← 5 agent specs
├── tier3-outreach/                            ← 6 agent specs
├── tier4-governance/                          ← 5 agents + policies
├── tier5-supporting/                          ← 13 agent specs
└── notebooks/
    └── Master_Career_Branding_Notebook.ipynb  ← Interactive dashboard
```

---

## 11. Quick Command Reference

| Task | Command / File |
|------|----------------|
| View master binder | `Master_Portfolio_Binder_Sam_Leong.md` |
| View notebook | `notebooks/Master_Career_Branding_Notebook.ipynb` |
| Check system registry | `registry/omniroute-master-registry-gemini-merged.json` |
| Log a change | Edit `CHANGE_LOG.md` with JSON schema |
| View rewrite policy | `tier4-governance/rewrite-governance-policy.md` |
| Deploy Stamford Tyres | `Application_Package_Stamford_Tyres.md` |
| Deploy Maersk | `Application_Package_Maersk.md` |
| Deploy Google Cloud | `Application_Package_Google_Cloud.md` |
| Deploy TikTok | `Application_Package_TikTok.md` |
| Deploy AWS | `Application_Package_AWS.md` |
| View all agent specs | `tier1-core-assets/` through `tier5-supporting/` |

---

## 12. Dashboard KPIs at a Glance

| Metric | Current | Target |
|--------|---------|--------|
| **CV ATS Match Score** | 96.8% | ≥95% |
| **LinkedIn Connections** | 1,000+ | 1,500+ |
| **Monthly Profile Views** | Baseline | +50% |
| **Inbound Opportunities/month** | 0–1 | 3+ |
| **Application Conversion** | Baseline | ≥15% |
| **Compensation Floor** | S$120K | S$144K+ |
| **Offer Premium Target** | — | 15–25% |

---

## 13. Critical Reminders

1. **NO REWRITES** without validated trigger + 8-step governance process
2. **CV v2.4-ST is LOCKED** — only patch-level edits allowed without full rewrite
3. **Cover Letters** can be tailored per application but must stay within variant scope
4. **Executive Dossier** must sync 100% with CV dates and certifications
5. **Change Log** is mandatory for every asset modification
6. **Backup zip** required before any deployment
7. **72-hour SLA** on all applications via Opportunity Flow Agent
8. **<12-hour SLA** on all recruiter emails via Email Outreach Agent
9. **Weekly review** Friday 17:00 SGT — non-negotiable
10. **Quarterly review** 2026-11-26 — full brand audit

---

## 14. Support & Escalation

| Issue | Escalate To |
|-------|-------------|
| CV rewrite needed | T4-01 Rewrite Governance Agent |
| KPI threshold breach | T2-03 Risk Mitigation Agent |
| Governance policy question | T4-05 Governance Roles Agent |
| Content calendar gap | T5-02 Content Authority Agent |
| Opportunity pipeline stall | T5-09 Opportunity Flow Agent |
| Compensation question | T5-10 Compensation Leverage Agent |

---

**🟢 System Status: 100% OPERATIONAL — ALL 34 AGENTS ACTIVE, ALL ASSETS DEPLOYMENT-READY**

**Next Action:** Select an application package and deploy.
