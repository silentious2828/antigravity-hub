# Career Branding Engine
**Purpose:** Dual-track career branding assets for executive placement and AI enterprise positioning.  
**Operator:** Sam Leong  
**Status:** Production-Ready

## Structure

```
career-branding/
├── README.md                    ← This file
├── cv/                          ← 6 tailored CVs (Track A: ATS-optimized)
│   ├── CV_1_Maersk_Regional_Head_Chartering.md
│   ├── CV_2_Maersk_Operational_Excellence.md
│   ├── CV_3_Google_Cloud_APAC_Strategic_Engagement.md
│   ├── CV_4_TikTok_Eco_Project_Manager.md
│   ├── CV_5_AWS_Principal_Partner_Development_AI.md
│   └── CV_6_Microsoft_Energy_Program_Manager.md
├── cover-letters/               ← Master + 3 variants
│   ├── Cover_Letter_Master_Sam_Leong.md
│   ├── Cover_Letter_Variant_A_Global_Distribution.md
│   ├── Cover_Letter_Variant_B_Enterprise_AI.md
│   └── Cover_Letter_Variant_C_SAP_MM.md
├── dossiers/                    ← Executive deep-dive (Track B)
│   └── Executive_Dossier_Sam_Leong.md
├── linkedin/                    ← Profile + content assets
│   ├── LinkedIn_Headline_About.md
│   ├── LinkedIn_Posts_Week1-2.md
│   ├── InMail_Template_1_Tier1_Search.md
│   └── InMail_Template_2_Direct_Followup.md
├── application-packages/        ← Target-specific application bundles
│   ├── Application_Package_AWS.md
│   ├── Application_Package_Google_Cloud.md
│   ├── Application_Package_Maersk.md
│   ├── Application_Package_Microsoft_Energy.md
│   ├── Application_Package_Stamford_Tyres.md
│   └── Application_Package_TikTok.md
└── supporting/                  ← Resume, deck, playbook, negotiation
    ├── Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.md
    ├── Boardroom_Deck_Outline.md
    ├── Interview_Playbook.md
    ├── Negotiation_Matrix.md
    └── Master_Portfolio_Binder_Sam_Leong.md
```

## Dual-Track Deployment

- **Track A (Copilot ATS CV v2.4-ST):** Optimized for Workday/ATS parsing. Keyword-rich, quantification-first.
- **Track B (Gemini Executive Dossier):** C-Suite/Board deep-dive narrative for executive search partners.

## Governance

All core assets are governed by the 8-Step Controlled Rewrite Engine defined in `tier4-governance/rewrite-governance-policy.md`.

## Agent Specifications

Career branding agents are defined in:
- `tier1-core-assets/` — CV, Cover Letter, Executive Dossier, Podcast, Final Goals
- `tier2-metrics/` — Analytics, 90-Day Plan, Risk, Success Metrics, Review Cadence
- `tier3-outreach/` — Email, LinkedIn Profile/Posts/Articles, Podcast Platform, Website
- `tier4-governance/` — Roles, Versioning, Change Log, Rewrite Governance
- `tier5-supporting/` — Boardroom Deck, Content Authority, Positioning, Executive Search, Referral, Compensation, Network, Opportunity Filter, Testimonial, Narrative Mastery, Opportunity Flow, Negotiation, Succession Legacy
