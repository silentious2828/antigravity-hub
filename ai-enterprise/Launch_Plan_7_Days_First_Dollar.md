# 7-Day Launch Plan — AI Automation Agency
**Business:** Supply Chain / SAP AI Automation Agency  
**Operator:** Sam Leong  
**Goal:** First paying client within 7–14 days  
**Status:** Production-Ready

---

## DAY 1: OFFER + CASE STUDIES (4 hours)

### Morning (2 hours)
- [ ] Write one-page offer using this template:
  ```
  [Company Name] — Supply Chain AI Automation
  
  I automate procurement, order-to-cash, and supplier reporting 
  with AI agents — cutting manual work hours in half.
  
  Packages:
  • Quick Win: S$1,500 (1 workflow, 7-day delivery)
  • Core: S$2,500 setup + S$800/mo (3 workflows + monitoring)
  • Scale: S$5,000 setup + S$2,000/mo (full ops dashboard)
  
  Mini case studies:
  1. "At NCS Group, I delivered 30% QA efficiency gain via AI agent automation"
  2. "At Digital Bridgestone, I reduced fleet downtime 15% via SAP MM + predictive maintenance"
  ```

### Afternoon (2 hours)
- [ ] Create Notion page or Google Doc with offer
- [ ] Add Calendly link for S$500 diagnostic booking
- [ ] Set up Stripe account for invoicing
- [ ] Create HubSpot free CRM account

---

## DAY 2: AGENT STACK SETUP (4 hours)

### Morning (2 hours)
- [ ] Sign up for n8n Cloud (or self-host on AWS/VPS)
- [ ] Create Claude API account + add S$50 credit
- [ ] Sign up for Instantly (cold email tool)
- [ ] Connect Instantly to n8n via API

### Afternoon (2 hours)
- [ ] Build first reusable workflow in n8n:
  ```
  Trigger: New lead from Instantly
  ↓
  Action: Claude API enriches lead data (company size, tech stack, pain signals)
  ↓
  Action: HubSpot CRM creates/updates contact
  ↓
  Action: Slack notification to Sam
  ```
- [ ] Test end-to-end with 5 dummy leads
- [ ] Document workflow SOP in Notion

---

## DAY 3–4: TARGET LIST + OUTREACH (8 hours)

### Morning Day 3 (4 hours): Build 50-company target list
**Target Criteria:**
- **Industry:** Logistics, freight forwarding, trading, automotive distribution, SAP implementation
- **Geography:** Singapore (primary), Malaysia, Indonesia, Thailand
- **Size:** 50–500 employees (SMB sweet spot — fast decision makers)
- **Tech signals:** Job postings mentioning SAP MM, Oracle, order-to-cash, procurement automation
- **Pain signals:** Recent hiring for supply chain roles, expansion news, tech stack gaps

**Research Method:**
1. LinkedIn Sales Navigator: search "SAP MM" + "Singapore" + "Logistics"
2. Apollo.io: filter by industry, size, tech stack
3. Hunter.io: verify emails
4. Google News: recent expansion/tech investment signals

**Output:** CSV with columns:
- Company name
- Contact name, title, email
- Industry, size, location
- Pain signals (from job postings/news)
- Priority score (1–10)

### Afternoon Day 3 + Day 4: Write + Send Outreach
- [ ] Write 3 email templates (cold outreach, follow-up, breakup)
- [ ] Personalize first 10 emails manually (Sam reviews)
- [ ] Launch REV-02 agent for automated personalization
- [ ] Send 25 emails/day × 2 days = 50 emails total
- [ ] Track opens, clicks, replies in Instantly dashboard

---

## DAY 5: DIAGNOSTIC OFFER (2 hours)

- [ ] Create S$500 "Automation Audit" offer:
  ```
  I'll map your top-3 automation opportunities in 48 hours.
  You get: 
  - Process audit document
  - ROI estimate for each automation
  - 7-day implementation roadmap
  
  If you proceed with implementation, the S$500 is credited 
  toward your project fee.
  ```
- [ ] Add audit offer to one-page and Calendly
- [ ] Create Stripe payment link for S$500 audit
- [ ] Prepare 48-hour delivery template for audit document

---

## DAY 6–7: FOLLOW-UP + CLOSE (4 hours)

- [ ] Send follow-up emails to non-responders (Day 6)
- [ ] Send breakup email to non-responders (Day 7)
- [ ] Respond to all replies personally (Sam)
- [ ] Book diagnostic calls via Calendly
- [ ] Send calendar invites + prep questionnaire
- [ ] If any audits sold: deliver within 48 hours using Claude API template

---

## 50-COMPANY TARGET LIST CRITERIA

### Primary Targets (Singapore)
| Company Type | Examples | Decision Maker | Pain Point |
|--------------|----------|----------------|------------|
| SAP implementation partners | | SAP MM Lead, Delivery Manager | Client reporting automation |
| Freight forwarders | | Head of Operations, CFO | Invoice processing, customs docs |
| Automotive distributors | | Supply Chain Manager, Head of Export | Inventory management, dealer reporting |
| Trading companies | | Procurement Head, Finance Director | Supplier onboarding, PO processing |

### Secondary Targets (Malaysia/Indonesia/Thailand)
| Company Type | Pain Point | Trigger |
|--------------|------------|---------|
| 3PL providers | Warehouse management, shipment tracking | Recent expansion, hiring spree |
| E-commerce logistics | Order fulfillment, last-mile tracking | Growth funding, new warehouse |
| Commodity traders | Supplier data, contract management | Commodity price volatility |
| Manufacturing | Procurement, inventory, QC reporting | SAP rollout, digital transformation |

### Lead Scoring Matrix
| Criterion | Points |
|-----------|--------|
| SAP MM user (job posting / tech stack) | 40 |
| C-level / Director title | 30 |
| 100–500 employees | 20 |
| Recent hiring for supply chain roles | 10 |
| **Total max** | **100** |

**Hot lead threshold:** >80 points → immediate proposal (REV-04)  
**Warm lead threshold:** 50–80 points → nurture sequence  
**Cold lead threshold:** <50 points → discard

---

## EXPECTED OUTCOMES

| Metric | Conservative | Base Case | Stretch |
|--------|-------------|-----------|---------|
| Emails sent | 50 | 100 | 200 |
| Open rate | 15% | 20% | 25% |
| Reply rate | 3% | 5% | 8% |
| Diagnostic calls booked | 1–2 | 3–5 | 6–8 |
| Diagnostic → paid conversion | 25% | 35% | 50% |
| First client (day) | Day 14 | Day 10 | Day 7 |
| First revenue | S$1,500 | S$2,500 | S$5,000 |

---

## SUCCESS CRITERIA (END OF WEEK 1)

- [ ] One-page offer live + Calendly active
- [ ] n8n workflow deployed + tested
- [ ] 50-company target list built
- [ ] 50+ outreach emails sent
- [ ] 3+ replies received
- [ ] 1+ diagnostic call booked
- [ ] S$500 audit offer ready to close

---

## SAM'S WEEKLY TIME COMMITMENT (POST-LAUNCH)

| Activity | Time/Week |
|----------|-----------|
| Review proposals (REV-04 gate) | 2 hours |
| Respond to high-value leads | 2 hours |
| Weekly agent performance review | 1 hour |
| Client delivery oversight | 4 hours |
| **Total** | **~9 hours/week** |

This is not "passive income" — it's a lean, AI-augmented practice where Sam is the expert layer, not the execution layer.

---

*Launch plan v1.0 — Ready to execute. Start Day 1 tomorrow.*
