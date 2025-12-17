import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

// Stripe webhook secret from environment
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn("STRIPE_WEBHOOK_SECRET not set - webhook verification disabled");
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const priceKey = session.metadata?.priceKey;

        if (!userId) {
          console.error("No userId in session metadata");
          break;
        }

        // Handle payment (one-time purchase)
        if (session.payment_status === "paid" && session.mode === "payment") {
          // Get credits amount
          let creditsAmount = 0;
          if (priceKey === "CREDITS_50") creditsAmount = 50;
          else if (priceKey === "CREDITS_200") creditsAmount = 200;
          else if (priceKey === "CREDITS_500") creditsAmount = 500;

          if (creditsAmount > 0) {
            // Update profile credits
            const { data: profile, error: selectError } = await supabaseAdmin
              .from("profiles")
              .select("credits")
              .eq("id", userId)
              .single();

            if (!selectError && profile) {
              const newCredits = (profile.credits || 0) + creditsAmount;

              await supabaseAdmin
                .from("profiles")
                .update({ credits: newCredits })
                .eq("id", userId);

              // Log transaction
              await supabaseAdmin.from("credits_history").insert({
                user_id: userId,
                amount: creditsAmount,
                reason: `Purchased ${creditsAmount} credits`,
                stripe_event_id: event.id,
              });

              console.log(`Added ${creditsAmount} credits to user ${userId}`);
            }
          }
        }
        break;
      }
      case "charge.refunded": {
        // TODO: Handle refunds when needed
        console.log("Charge refunded event received", event.data.object);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
