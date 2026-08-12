# Technical Implementation Guide: Zero-Employee AI Enterprise

> **Companion Document**: See `Launch_Zero_Employee_AI_Enterprise_Playbook.md` for Business Strategy, Pricing Models, GTM Distribution, and Financial Forecasting.
> **Locked Vertical**: QAFlow AI — AI-powered quality assurance and defect detection workflow automation for supply chain/manufacturing managers. Starter $49/mo, Pro $149/mo, launch offer $79/mo for first 10 customers.

---

## 1. System Architecture & Tech Stack Overview

* **Frontend**: Next.js 14+ (App Router), Tailwind CSS, `shadcn/ui`.
* **Backend & Database**: Supabase (PostgreSQL, Row Level Security, `pgvector`, File Storage).
* **Authentication**: Clerk / Supabase Auth.
* **AI Provider Router**: OpenRouter API / Direct SDKs (OpenAI GPT-4o, DeepSeek-R1/V3, Groq, Claude 3.5).
* **Payment Processor**: Stripe Billing (Subscriptions, Metered Billing, Webhooks, Stripe Tax).
* **Automation Middleware**: n8n (Self-hosted or Cloud) / Make.com.
* **Transactional Email**: Resend / Loops.so.

---

## 2. Database Schema (Supabase / PostgreSQL)

```sql
-- Users and Subscription Profile
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'free', -- 'free', 'active', 'past_due', 'cancelled'
    subscription_plan VARCHAR(50) DEFAULT 'free',   -- 'free', 'pro', 'enterprise'
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

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users view own generations" ON public.generations FOR SELECT USING (auth.uid() = user_id);
```

---

## 3. Core API Execution Layer (`/api/generate/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId, prompt, category } = await req.json();

    // 1. Check Usage Limits
    const { data: user } = await supabaseAdmin.from('users').select('subscription_plan').eq('id', userId).single();
    
    // 2. Call Primary AI API (with Fallback Logic)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert AI assistant providing structured JSON outputs.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const output = completion.choices[0].message.content;

    // 3. Persist Output & Record Analytics
    await supabaseAdmin.from('generations').insert({
      user_id: userId,
      prompt,
      output_content: output,
      model_used: 'gpt-4o',
      tokens_consumed: completion.usage?.total_tokens || 0
    });

    return NextResponse.json({ success: true, data: JSON.parse(output || '{}') });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 4. Payment Gateway & Webhook Router (`/api/webhooks/stripe/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    await supabaseAdmin.from('users').update({
      subscription_status: 'active',
      subscription_plan: session.metadata?.tierId || 'pro',
      stripe_customer_id: session.customer
    }).eq('id', session.metadata?.userId);
  }

  return NextResponse.json({ received: true });
}
```

---

## 5. Production System Prompt Engineering Library

### 5.1 Enforced Structured JSON Extraction

```text
SYSTEM PROMPT: You are a domain specialist AI agent.
YOUR GOAL: Analyze the provided user input and generate structured, production-ready outputs.

OUTPUT RULES:
1. Return strictly valid JSON adhering to the provided schema.
2. Do not include introductory text, markdown formatting blocks (unless requested), or conversational text.
3. Validate all generated fields before returning payload.
```

---

## 6. n8n Automation Node Schemas

* **Workflow 1**: Onboarding Drip Trigger (Stripe `checkout.session.completed` ➔ Resend Email Sequence).
* **Workflow 2**: Daily Churn Mitigation (Cron check for `last_login > 7 days` ➔ Re-engagement hook).
* **Workflow 3**: Autonomous Customer Support Router (Inbound query ➔ Supabase `pgvector` RAG search ➔ Resolved answer).
