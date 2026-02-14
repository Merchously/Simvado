import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type { SubscriptionTier } from "@prisma/client";
import Stripe from "stripe";

function priceToTier(priceId: string | undefined): SubscriptionTier {
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "pro_monthly";
  if (priceId === process.env.STRIPE_PRICE_PRO_ANNUAL) return "pro_annual";
  return "free";
}

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer && session.metadata?.userId) {
        let tier: SubscriptionTier = "pro_monthly";
        if (session.subscription) {
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const priceId = sub.items.data[0]?.price.id;
          tier = priceToTier(priceId);
        }
        await db.user.update({
          where: { id: session.metadata.userId },
          data: {
            stripeCustomerId: session.customer as string,
            subscriptionTier: tier,
          },
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = priceToTier(priceId);
      await db.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: { subscriptionTier: tier },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: { subscriptionTier: "free" },
      });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn(
        `Payment failed for customer ${invoice.customer}, invoice ${invoice.id}`
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
