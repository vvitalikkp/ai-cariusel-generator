import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Stripe from "stripe"

export async function POST(req: Request) {
  try {
    // Identity from the server session, not the request body — a Stripe
    // checkout should always be created for whoever is actually signed in,
    // not whatever email a client happens to send.
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) {
      return NextResponse.json({ error: "sign_in_required" }, { status: 401 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const { plan } = await req.json()

    if (plan === "ltd") {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "CarouselAI — Lifetime Deal",
                description: "All Pro features, forever. One payment, no subscription.",
              },
              unit_amount: 5900,
            },
            quantity: 1,
          },
        ],
        metadata: { plan: "ltd" },
        success_url: `${process.env.NEXTAUTH_URL}/ltd?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/ltd?canceled=true`,
      })
      return NextResponse.json({ url: checkoutSession.url })
    }

    const isAnnual = plan === "pro_annual"

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: isAnnual ? "CarouselAI Pro (Annual)" : "CarouselAI Pro",
              description: "Unlimited carousels, PNG + PDF export, no watermark",
            },
            unit_amount: isAnnual ? 22800 : 2400,
            recurring: { interval: isAnnual ? "year" : "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { plan: isAnnual ? "pro_annual" : "pro_monthly" },
      success_url: `${process.env.NEXTAUTH_URL}?success=true&plan=${isAnnual ? "pro_annual" : "pro_monthly"}`,
      cancel_url: `${process.env.NEXTAUTH_URL}?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
