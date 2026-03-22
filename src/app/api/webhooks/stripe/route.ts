import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

function getSubscriptionPeriodEnd(subscription: Record<string, unknown>): string | null {
  const end = subscription.current_period_end;
  if (typeof end === "number") {
    return new Date(end * 1000).toISOString();
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (userId && subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
          const selfHostedPriceId = process.env.STRIPE_SELF_HOSTED_PRICE_ID;

          let status: "pro" | "self_hosted" = "pro";
          if (priceId === selfHostedPriceId) status = "self_hosted";
          else if (priceId === proPriceId) status = "pro";

          await supabase
            .from("profiles")
            .update({
              stripe_customer_id: customerId,
              subscription_id: subscriptionId,
              subscription_status: status,
              current_period_end: getSubscriptionPeriodEnd(
                subscription as unknown as Record<string, unknown>
              ),
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const priceId = subscription.items.data[0]?.price.id;
        const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
        const selfHostedPriceId = process.env.STRIPE_SELF_HOSTED_PRICE_ID;

        let status: "pro" | "self_hosted" | "canceled" = "pro";
        if (subscription.cancel_at_period_end) {
          status = "canceled";
        } else if (priceId === selfHostedPriceId) {
          status = "self_hosted";
        } else if (priceId === proPriceId) {
          status = "pro";
        }

        await supabase
          .from("profiles")
          .update({
            subscription_status: status,
            current_period_end: getSubscriptionPeriodEnd(
              subscription as unknown as Record<string, unknown>
            ),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
            subscription_id: null,
            current_period_end: null,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
