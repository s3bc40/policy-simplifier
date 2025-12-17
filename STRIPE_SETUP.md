# Stripe Integration Setup

## Step 1: Environment Variables

Add these to your `.env.local` file:

```
STRIPE_SECRET_KEY=sk_test_... # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe Webhooks settings
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Your app URL
```

### Optional (if you want custom pricing IDs)

```
STRIPE_PRICE_CREDITS_20=price_... # Stripe price ID for 20 credits
STRIPE_PRICE_CREDITS_75=price_... # Stripe price ID for 75 credits
STRIPE_PRICE_CREDITS_200=price_... # Stripe price ID for 200 credits
```

If not provided, the app uses hardcoded pricing (you can update in `lib/stripe/client.ts`).

## Step 2: Create Stripe Products & Prices

1. Go to https://dashboard.stripe.com
2. Navigate to Products (in Stripe Dashboard menu)
3. Create a product called "Policy Simplifier Credits"
4. Add three prices:
   - 20 credits: $2.99 (one-time payment)
   - 75 credits: $9.99 (one-time payment)
   - 200 credits: $24.99 (one-time payment)
5. Copy each price ID (starts with `price_`) to your `.env.local` or use the hardcoded values in `lib/stripe/client.ts`

## Step 3: Setup Webhook Endpoint

1. Go to Webhooks (Developers > Webhooks menu)
2. Click "Add endpoint"
3. For development: Use Stripe CLI (see Local Testing below)
4. For production: Enter `https://yourdomain.com/api/webhooks/stripe`
5. Select event to listen to: `checkout.session.completed`
6. Copy the "Signing secret" and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Local Testing with Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run in terminal:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Copy the webhook signing secret from CLI output
4. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Test Card Numbers

Use these in test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Require authentication**: `4000 0025 0000 3155`

Use any future expiration date and any 3-digit CVC.

## Pricing Breakdown

| Credits | Price  | Per Credit | Use Case             |
| ------- | ------ | ---------- | -------------------- |
| 5       | FREE   | -          | Starter (current)    |
| 20      | $2.99  | $0.15      | Impulse buy - try it |
| 75      | $9.99  | $0.13      | Regular user         |
| 200     | $24.99 | $0.12      | Power user           |

All credits never expire and roll over.
