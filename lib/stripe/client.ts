import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
});

// Pricing configuration - Credits only (no subscriptions)
// Aggressive startup pricing: low entry point with natural tier progression
export const STRIPE_PRICING = {
  CREDITS_20: {
    id: process.env.STRIPE_PRICE_CREDITS_20 || "price_credits_20",
    name: "20 Credits",
    credits: 20,
    amount: 299, // $2.99 in cents - impulse buy
  },
  CREDITS_75: {
    id: process.env.STRIPE_PRICE_CREDITS_75 || "price_credits_75",
    name: "75 Credits",
    credits: 75,
    amount: 999, // $9.99 in cents - regular user
  },
  CREDITS_200: {
    id: process.env.STRIPE_PRICE_CREDITS_200 || "price_credits_200",
    name: "200 Credits",
    credits: 200,
    amount: 2499, // $24.99 in cents - power user
  },
};
