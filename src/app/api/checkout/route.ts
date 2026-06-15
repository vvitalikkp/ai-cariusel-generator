import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const { email, plan } = await req.json()

    // Pro+ subscription
    if (plan === "pro_plus") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "CarouselAI Pro+",
                description: "Unlimited carousels, PDF export, priority support",
              },
              unit_amount: 1900,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXTAUTH_URL}?success=true&plan=pro_plus`,
        cancel_url: `${process.env.NEXTAUTH_URL}?canceled=true`,
      })
      return NextResponse.json({ url: session.url })
    }

    // Pro one-time $49
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "CarouselAI Pro",
              description: "50 carousels, PDF export, no watermark",
            },
            unit_amount: 4900,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}?success=true&plan=pro`,
      cancel_url: `${process.env.NEXTAUTH_URL}?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}