---
name: stripe
description: |
  Implements Stripe payment flows, subscriptions, and webhook handling.
  Use when: integrating payments, building checkout flows, managing subscriptions, or handling Stripe webhooks.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Stripe Skill

This skill covers Stripe API integration for payments, subscriptions, and checkout flows. Uses the official `stripe` Node.js SDK with TypeScript.

## Quick Start

### One-Time Payment with Checkout

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create a Checkout Session (server-side)
async function createCheckoutSession(priceId: string, customerId?: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/cancel`,
  });

  return session.url; // Redirect user here
}
```

### Subscription with Checkout

```typescript
async function createSubscription(priceId: string, customerId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/pricing`,
  });

  return session.url;
}
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Checkout Session | Hosted payment page | One-time and recurring payments |
| Payment Intent | Low-level payment API | Custom payment flows |
| Customer | Stored payment info | Returning users |
| Subscription | Recurring billing | SaaS, memberships |
| Webhook | Server-to-server events | Payment confirmations |
| Price | Amount + billing interval | Product pricing |

## Common Patterns

### Webhook Handler

**When:** Processing payment events server-side (required for reliability)

```typescript
import { buffer } from 'micro'; // or use raw body parser

async function handleWebhook(req: Request): Promise<Response> {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillOrder(session);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscriptionStatus(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await cancelSubscription(subscription);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleFailedPayment(invoice);
      break;
    }
  }

  return new Response('ok', { status: 200 });
}
```

### Customer Portal

**When:** Letting users manage their subscription

```typescript
async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.APP_URL}/dashboard`,
  });

  return session.url; // Redirect user here
}
```

### Sync Subscription Status

**When:** Keeping your database in sync with Stripe

```typescript
async function syncSubscription(subscription: Stripe.Subscription) {
  await db.subscription.upsert({
    where: { stripeId: subscription.id },
    update: {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      priceId: subscription.items.data[0].price.id,
    },
    create: {
      stripeId: subscription.id,
      userId: subscription.metadata.userId,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      priceId: subscription.items.data[0].price.id,
    },
  });
}
```

## Pitfalls

- **Never trust client-side payment confirmation** — always verify via webhooks
- **Webhook idempotency** — events can be delivered multiple times; use `event.id` to deduplicate
- **Use Stripe Checkout** over custom forms when possible — it handles PCI compliance, 3D Secure, and localization
- **Store Stripe Customer ID** in your database — link it at signup, not at first payment
- **Test with Stripe CLI** — `stripe listen --forward-to localhost:3000/webhook` for local development

## Related Skills

For backend integration, see the **nodejs** skill. For database sync, see the **prisma** skill. For TypeScript types, see the **typescript** skill.

## Documentation Resources

> Fetch latest Stripe documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "stripe"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Checkout Session creation and configuration"
- "Webhook event handling and verification"
- "Subscription lifecycle and billing"
- "Customer portal setup"
