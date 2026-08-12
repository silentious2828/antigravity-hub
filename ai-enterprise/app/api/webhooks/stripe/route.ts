import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

// Map Stripe Price IDs → internal tier names
const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER!]: 'starter',
  [process.env.STRIPE_PRICE_PRO!]: 'pro',
  [process.env.STRIPE_PRICE_LAUNCH!]: 'launch',
}

// Map tier → feature limits
const TIER_LIMITS: Record<string, { monthlyTokens: number; concurrentJobs: number }> = {
  starter: { monthlyTokens: 100_000, concurrentJobs: 1 },
  pro: { monthlyTokens: 500_000, concurrentJobs: 5 },
  launch: { monthlyTokens: 250_000, concurrentJobs: 3 },
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('⚠️ Stripe signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleCancellation(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        await handleFailedPayment(event.data.object as Stripe.Invoice)
        break
      case 'invoice.paid':
        console.log('✅ Invoice paid:', event.data.object.id)
        break
      default:
        console.log('ℹ️ Unhandled event type:', event.type)
    }
  } catch (err) {
    console.error('❌ Error processing event:', event.type, err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id
  const tier = PRICE_TO_TIER[priceId] ?? null

  if (!tier) {
    console.warn('⚠️ Unknown price ID:', priceId, 'for customer:', customerId)
    return
  }

  const limits = TIER_LIMITS[tier]

  // TODO: Update Supabase users table
  // await supabase.from('users').upsert({
  //   stripe_customer_id: customerId,
  //   tier,
  //   monthly_token_limit: limits.monthlyTokens,
  //   concurrent_job_limit: limits.concurrentJobs,
  //   subscription_status: subscription.status,
  //   updated_at: new Date().toISOString(),
  // })

  console.log(`✅ Customer ${customerId} → tier: ${tier}`, limits)
}

async function handleCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // TODO: Downgrade to free tier
  // await supabase.from('users').update({
  //   tier: 'free',
  //   monthly_token_limit: 10_000,
  //   concurrent_job_limit: 0,
  //   subscription_status: 'cancelled',
  //   updated_at: new Date().toISOString(),
  // }).eq('stripe_customer_id', customerId)

  console.log(`🚫 Customer ${customerId} subscription cancelled`)
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // TODO: Trigger n8n failed-payment webhook
  // await fetch(process.env.N8N_FAILED_PAYMENT_WEBHOOK!, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     customerId,
  //     invoiceId: invoice.id,
  //     amount: invoice.amount_due,
  //     attemptCount: invoice.attempt_count,
  //   }),
  // })

  console.log(`⚠️ Failed payment for customer ${customerId}, attempt: ${invoice.attempt_count}`)
}
