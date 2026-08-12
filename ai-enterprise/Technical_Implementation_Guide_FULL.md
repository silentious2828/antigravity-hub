# Technical Implementation Guide — Supply Chain AI (Phase 2 Reference)

**Version:** 1.0 | **Purpose:** Phase-2 SaaS build reference (productize a validated agency workflow)
**Operator:** Sam Leong | **Architecture:** Next.js 14 + Supabase + n8n + Multi-Provider AI
**Primary AI:** Claude 3.5 Sonnet → OpenAI GPT-4o → DeepSeek-R1 → Groq
**Status:** Captured for Phase 2. **Do NOT build until 1+ paying agency client validates a workflow.**

---

## ⚠️ PHASE GATE (read first)
This guide is the **Phase-2** productization reference. The correct sequence is:
1. **Phase 1 (now):** Agency — send cold emails, close clients, deliver Quick Win workflows (see `outreach/`)
2. **Phase 2 (after client 1):** Take the workflow the client paid for → build it as a micro-SaaS using this guide
3. **Phase 3:** SaaS recurring revenue compounds on top of agency revenue

Building the SaaS before a paying client is **building ahead of demand.** This file is captured so you don't have to re-derive it later — not so you start coding this week.

---

## Repository Structure
```
/ai-enterprise/
├── app/
│   ├── api/
│   │   ├── generate/stream/route.ts    # SSE Streaming + fallback
│   │   └── health/route.ts             # Provider health check
│   └── (dashboard)/page.tsx
├── lib/
│   ├── ai.ts                           # Multi-provider fallback service
│   └── utils/prompts.js                # Production prompt library
├── automation/
│   ├── n8n_onboarding_workflow.json
│   └── n8n_dunning_workflow.json
├── scripts/
│   └── create-stripe-products.js
└── database/
    └── schema.sql
```

---

## Part 1 — API Routes

### 1.1 Streaming with Multi-Provider Fallback
`app/api/generate/stream/route.ts` — SSE streaming, Claude → OpenAI → DeepSeek/Groq. Edge runtime.
- Validates `prompt` + `userId`
- Returns `text/event-stream` with `data:` frames tagged by `provider`
- Each provider wrapped in try/catch → falls through to next on error
- Final catch emits `{ error: 'All AI providers failed' }`

### 1.2 Health Check
`app/api/health/route.ts` — pings anthropic/openai/openrouter/groq, returns per-provider `{status, latencyMs}` + overall `operational | critical`.

---

## Part 2 — Prompt Library (`lib/utils/prompts.js`)
Structured-JSON-enforced supply chain prompts. **This is the differentiated IP — reuse these for the agency audits too.**
- `supplierRiskAudit` → JSON: `{ supplier_assessment, risk_breakdown[], cost_optimization_opportunities[] }`
- `inventoryOptimization` → JSON: `{ inventory_health, reorder_recommendations[] }`
- `orderToCashAnalysis` → JSON: `{ otc_health, bottleneck_analysis[] }`
- `sapMmEnrichment` → JSON: material master enrichment
- `demandForecasting` → JSON: per-SKU historical + forecast

**Key principle:** every prompt returns ONLY valid JSON matching a fixed schema (deterministic, machine-readable) — no conversational fluff. This is what makes the output trustworthy enough to charge for.

---

## Part 3 — n8n Workflows
- `n8n_onboarding_workflow.json`: Stripe webhook → filter `checkout.session.completed` → upsert user in Supabase → send onboarding email
- `n8n_dunning_workflow.json`: Stripe webhook → filter `invoice.payment_failed` → look up user → first/second dunning email by attempt count

---

## Part 4 — Stripe Billing
`scripts/create-stripe-products.js` — idempotent product+price creation. Tiers (SGD):

| Tier | Monthly | Annual | Tokens | Workflows |
|------|---------|--------|--------|-----------|
| Starter | S$29 | S$290 | 100K | 1 |
| Pro | S$99 | S$990 | 500K | 5 |
| Enterprise | S$299 | S$2,990 | 5M | Unlimited |

Usage-gating in `/api/generate`: check `token_balance` → 402 + upgradeUrl if insufficient → generate → log to `generations` → deduct balance.

---

## Part 5 — Database (`database/schema.sql`)
Tables: `users`, `workflows`, `generations`, `usage_limits`. Extensions: `pgvector`, `uuid-ossp`. RLS policies on all tables. Indexes on `generations(user_id)`, `generations(created_at)`.

---

## Part 6 — 7-Day Execution Checklist (Phase 2)
| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Run `schema.sql` in Supabase | Tables + RLS live |
| 2 | Deploy API routes to Vercel | Streaming + health live |
| 3 | Stripe products + webhooks | Billing active |
| 4 | Landing + dashboard | Frontend deployed |
| 5 | Import n8n workflows | Automation live |
| 6 | Publish 50+ pSEO pages | Traffic primed |
| 7 | Cold email + Product Hunt | First SaaS users |

---

*Captured 2026-08-07 as Phase-2 reference. Phase 1 (agency, emails) is the active priority.*
