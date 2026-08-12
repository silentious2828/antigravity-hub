# AI Enterprise Operational Dashboard Guide

## Overview
Jupyter notebook for AI enterprise operations with Stripe payment integration,
outreach tracking, financial modeling, and agent performance monitoring.

## Prerequisites
```bash
# Install the data-agent-kit package
cd my-project
pip install -e .

# Install Jupyter and dependencies
pip install jupyter nbconvert plotly pandas numpy

# Start Jupyter
jupyter notebook
```

## Notebook Structure
The `AI_Enterprise_Operational_Dashboard.ipynb` contains 23 cells:

### Key Cells:
1. **Dependencies & Configuration** (Cell 0-2): Installs dependencies, loads CONFIG
2. **Daily Metrics Initialization** (Cell 5): Creates DataFrame with columns:
   - date, emails_sent, opens, clicks, replies
   - diagnostic_booked, diagnostic_completed, deals_won
   - revenue_setup, revenue_recurring **(Stripe)**
   - stripe_payments, stripe_subscribers **(Stripe)**
3. **Financial Model** (Cell 11): `FinancialModel` class with Stripe integration
   - Stripe module initialization from env vars
   - Standard Stripe fees (2.9% + $0.30)
   - Monthly costs (Claude, OpenAI, Deepseek, Groq)
4. **Stripe Payment Processing** (Cell after Cell 5): `process_stripe_payment()` function
   - Handles one-time and recurring payments
   - SGD to USD conversion (1.35 rate)
   - Updates metrics DataFrame
5. **Financial Projection** (Cell 12): Visualization includes total revenue
   - Base revenue + Stripe revenue
   - Bar chart: "Total Revenue (incl. Stripe)"

## Configuration (.env.local.template)
Copy `.env.local.template` to `.env.local` and fill in your keys:

```env
# Stripe (billing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...          # $49/mo (starter tier)
STRIPE_PRICE_PRO=price_...              # $149/mo (pro tier)
STRIPE_PRICE_LAUNCH=price_...           # $79/mo (launch tier)

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
GROQ_API_KEY=gsk-...

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email & Automation
RESEND_API_KEY=re_...
INSTANTLY_API_KEY=...
N8N_ONBOARDING_WEBHOOK=https://your-n8n.example/webhook/onboarding
N8N_CHURN_WEBHOOK=https://your-n8n.example/webhook/churn
```

## Daily Operations

### Updating Metrics
Each morning, run the daily execution checklist:
1. Send 25 personalized cold emails
2. Book 1 diagnostic appointment
3. Update metrics DataFrame via notebook cell 7
4. Review agent performance (Cell 14-15)
5. Update target list status (Cell 17-18)
6. Add daily notes (Cell 21-22)

### Financial Tracking
- **revenue_setup**: One-time setup revenue (quick wins: $1500, core: $2500)
- **revenue_recurring**: Monthly recurring revenue from Stripe subscriptions
- **stripe_payments**: Daily Stripe payment tracking
- **stripe_subscribers**: Active subscriber count

### Visualization
The notebook generates:
- 14-day outreach & conversion charts
- 6-month financial projections
- Agent performance summaries
- Target list status reports

## Stripe Integration Details

### Payment Processing
```python
# Process a one-time Stripe payment
metrics_df, revenue_sgd = process_stripe_payment(
    metrics_df, stripe, today, 1500,  # $1500 SGD
    customer_id="cust_abc123",
    plan_type="one-time"
)

# Process a recurring Stripe payment
metrics_df, revenue_sgd = process_stripe_payment(
    metrics_df, stripe, today, 149,    # $149 SGD monthly
    customer_id="cust_abc123",
    plan_type="recurring"
)
```

### Financial Model Components
```python
model = FinancialModel()
# Pricing from CONFIG
model.setup_quick      # $1500 (quick win)
model.setup_core       # $2500 (core setup)
model.monthly_core     # $299/mo (core tier)
model.setup_scale      # $5000 (scale setup)
model.monthly_scale    # $1999/mo (scale tier)
model.audit            # $500 (audit service)

# Monthly costs
model.costs = {
    "claude_api": 300,
    "openai_api": 200,
    "deepseek_api": 50,
    "groq_api": 150,
    "stripe_fees_percent": 2.9 + 0.30  # 2.9% + $0.30 per transaction
}
```

## Notebook Cell Reference

| Cell | Purpose |
|------|---------|
| 0-2 | Dependencies & CONFIG loading |
| 3 | Agent performance tracker (setup) |
| 4 | Target list manager (setup) |
| 5 | Initialize daily metrics DataFrame |
| 5 | **Add Stripe fields** (stripe_payments, stripe_subscribers) |
| 5 | **Add process_stripe_payment function** |
| 6-7 | Daily metrics update & Stripe payment processing |
| 8-9 | 14-day outreach & conversion visualization |
| 10-11 | Financial model & 6-month projection |
| 12-13 | Agent performance monitor |
| 13-14 | Target list manager |
| 15-16 | Daily execution checklist |
| 17-18 | Target list status & outreach summary |
| 19-20 | Daily execution checklist |
| 21-22 | Notes & action items |

## Running the Notebook
```bash
jupyter notebook ai-enterprise/AI_Enterprise_Operational_Dashboard.ipynb
```

Then execute cells in order, starting with Cell 0 to set up the environment,
and proceed through the daily operations workflow.

## Extension Points
- Add new Stripe price tiers by updating CONFIG pricing and .env.local.template
- Integrate additional AI providers by adding API keys and cost entries
- Connect to Supabase database by updating the storage client configuration
- Add more agent types by expanding the agent performance tracker
EOF
echo "AI enterprise guide created"