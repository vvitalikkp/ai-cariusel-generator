import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Stripe from "stripe"

// Identity from the server session, not the request body — otherwise
// anyone could POST a real customer's email and get a link into *their*
// Stripe Billing Portal (payment methods, ability to cancel their sub).

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) {
      return NextResponse.json({ error: "sign_in_required" })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const customers = await stripe.customers.list({ email, limit: 1 })
    const customer = customers.data[0]

    if (!customer) {
      return NextResponse.json({ error: "no_customer" })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXTAUTH_URL}/create`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
