"use server";

import { createClient as createSessionClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICING } from "@/lib/stripe/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function createCheckoutSession(formData: FormData) {
  const priceKey = formData.get("priceKey") as keyof typeof STRIPE_PRICING;

  // Authenticate user
  const sessionClient = await createSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get user profile
  const { data: profile, error: profileError } = await sessionClient
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Profile not found");
  }

  const pricing = STRIPE_PRICING[priceKey];
  let customerId = profile.stripe_customer_id;

  // Create or retrieve Stripe customer
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    customerId = customer.id;

    // Store customer ID in database
    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: pricing.id,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/billing?success=true`,
    cancel_url: `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/billing?canceled=true`,
    metadata: {
      userId: user.id,
      priceKey,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(session.url);
}
