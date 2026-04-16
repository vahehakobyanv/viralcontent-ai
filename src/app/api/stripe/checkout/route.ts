import { NextResponse } from "next/server";

// STUB: This is a demo implementation. In production, replace with a real
// Stripe Checkout Session creation using the @stripe/stripe-js server SDK:
//
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
//   const session = await stripe.checkout.sessions.create({
//     mode: "subscription",
//     line_items: [{ price: PRICE_ID, quantity: 1 }],
//     success_url: `${origin}/upgrade?success=true`,
//     cancel_url: `${origin}/upgrade?canceled=true`,
//     customer_email: user.email,
//   });
//   return NextResponse.json({ checkoutUrl: session.url });
//
// For now we just return a stub response so the UI can be tested end-to-end.

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: "Demo mode — would redirect to Stripe",
      checkoutUrl: "/upgrade?success=true",
      plan,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
