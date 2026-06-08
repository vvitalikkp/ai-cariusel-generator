import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const { email } = await req.json()

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
              description: "Unlimited LinkedIn carousel generations",
            },
            unit_amount: 1900,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}