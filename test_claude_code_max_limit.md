# Claude Code Maximum Limit Test Prompt
**Purpose:** Stress-test Claude Code with maximum context and multi-step complexity  
**Working Directory:** `/Volumes/Orico e7400 1TB/my-project`  
**Date:** 2026-08-06

---

## INSTRUCTIONS
Execute every step below in sequence without skipping. Confirm completion of each numbered step.

---

## STEP 1: WORKSPACE INVENTORY
Read and summarize the contents of ALL files in the project root (not nested directories). Output a table with filename, word count, and 1-line purpose for each file.

Files to scan:
- `/Volumes/Orico e7400 1TB/my-project/README.md`
- `/Volumes/Orico e7400 1TB/my-project/CHANGE_LOG.md`
- `/Volumes/Orico e7400 1TB/my-project/Master_Portfolio_Binder_Sam_Leong.md`
- `/Volumes/Orico e7400 1TB/my-project/Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.md`
- `/Volumes/Orico e7400 1TB/my-project/Cover_Letter_Master_Sam_Leong.md`
- `/Volumes/Orico e7400 1TB/my-project/Cover_Letter_Variant_A_Global_Distribution.md`
- `/Volumes/Orico e7400 1TB/my-project/Cover_Letter_Variant_B_Enterprise_AI.md`
- `/Volumes/Orico e7400 1TB/my-project/Cover_Letter_Variant_C_SAP_MM.md`
- `/Volumes/Orico e7400 1TB/my-project/Executive_Dossier_Sam_Leong.md`
- `/Volumes/Orico e7400 1TB/my-project/chapter-career-branding-final-goals.md`
- `/Volumes/Orico e7400 1TB/my-project/CV_1_Maersk_Regional_Head_Chartering.md`
- `/Volumes/Orico e7400 1TB/my-project/CV_2_Maersk_Operational_Excellence.md`
- `/Volumes/Orico e7400 1TB/my-project/CV_3_Google_Cloud_APAC_Strategic_Engagement.md`
- `/Volumes/Orico e7400 1TB/my-project/CV_4_TikTok_Eco_Project_Manager.md`
- `/Volumes/Orico e7400 1TB/my-project/CV_5_AWS_Principal_Partner_Development_AI.md`
- `/Volumes/Orico e7400 1TB/my-project/Application_Package_Stamford_Tyres.md`
- `/Volumes/Orico e7400 1TB/my-project/Application_Package_Maersk.md`
- `/Volumes/Orico e7400 1TB/my-project/Application_Package_Google_Cloud.md`
- `/Volumes/Orico e7400 1TB/my-project/Application_Package_TikTok.md`
- `/Volumes/Orico e7400 1TB/my-project/Application_Package_AWS.md`
- `/Volumes/Orico e7400 1TB/my-project/Dashboard_Operational_Instructions.md`
- `/Volumes/Orico e7400 1TB/my-project/registry/omniroute-master-registry-gemini-merged.json`

---

## STEP 2: AGENT SPEC CONSOLIDATION
Read ALL agent spec files across these directories and produce ONE consolidated table with columns: Tier | Agent ID | Agent Name | Version | Status | Key Responsibility

Directories:
- `/Volumes/Orico e7400 1TB/my-project/tier1-core-assets/`
- `/Volumes/Orico e7400 1TB/my-project/tier2-metrics/`
- `/Volumes/Orico e7400 1TB/my-project/tier3-outreach/`
- `/Volumes/Orico e7400 1TB/my-project/tier4-governance/`
- `/Volumes/Orico e7400 1TB/my-project/tier5-supporting/`

---

## STEP 3: GOVERNANCE COMPLIANCE AUDIT
Read these governance files and extract:
1. All 5 rewrite triggers from `rewrite-governance-policy.md`
2. All 8 steps from the controlled rewrite process
3. All status values from `change-log-schema.md`
4. Versioning rules from `versioning-policy.md`

Output as a numbered compliance checklist.

---

## STEP 4: CROSS-FILE CONSISTENCY CHECK
Compare these files for consistency and flag ANY discrepancies in:
- Candidate name / contact details
- Target compensation floor
- SAP MM certification ID
- Years of experience
- LinkedIn URL
- Key metrics (markets, shipments, efficiency gains)

Files to cross-check:
- `README.md`
- `CHANGE_LOG.md`
- `registry/omniroute-master-registry-gemini-merged.json`
- `Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.md`
- `Cover_Letter_Master_Sam_Leong.md`
- `Executive_Dossier_Sam_Leong.md`
- `Application_Package_*.md` (all 5)
- `Dashboard_Operational_Instructions.md`

Output format:
- ✅ Consistent
- ❌ Discrepancy: [file A] says X, [file B] says Y

---

## STEP 5: GAP ANALYSIS
Identify what is MISSING from the workspace vs the RAIN-CAG 34 specification. Cross-reference against these declared assets:

**Declared but NOT on disk:**
- `docs/Resume_Sam_Leong_Stamford_Tyres_International_Pte_Ltd.docx` (only .md exists)
- `archive/ARCHIVE-20260826-001/backups/CV_v2.4-ST_backup_20260826.zip`
- `audio/Podcast_Master_Career_Branding_Final_Goals.mp3`
- LinkedIn headline/summary drafts
- LinkedIn posts (2×/week calendar)
- LinkedIn articles
- Website bio (<250 chars)
- InMail templates (3 templates)
- 90-day plan with weekly actionable tasks
- Risk mitigation tracker
- Success metrics dashboard with real baseline data
- Negotiation matrix template
- Boardroom deck template
- Interview playbooks (60-second pitch, STAR stories)
- Testimonial request templates
- Referral outreach scripts
- Podcast RSS feed XML

Output each as: ❌ MISSING: [asset name] — [where it should live]

---

## STEP 6: OPTIMIZATION RECOMMENDATIONS
Based on the actual LinkedIn profile data provided earlier, write:
1. Optimized headline (≤220 chars)
2. Optimized About section (3–4 paragraphs with metrics)
3. NCS experience reframe (3 bullet points)
4. Top 10 skills reorder for ATS keyword optimization
5. Open to Work titles list

---

## STEP 7: EXECUTIVE SUMMARY
Synthesize findings into a 10-line executive summary covering:
- Total files scanned
- Total agents processed
- Governance compliance status
- Critical gaps
- Top 3 priority actions
- Estimated time to close gaps

---

## SUCCESS CRITERIA
- All 7 steps completed without skipping
- Tables formatted as Markdown
- All file paths verified as existing or marked MISSING
- Consistency check covers ALL listed files
- Recommendations are actionable and specific
