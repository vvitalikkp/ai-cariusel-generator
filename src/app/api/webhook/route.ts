import { NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

async function sendWelcomeEmail(email: string, isLtd = false) {
  try {
    await resend.emails.send({
      from: "CarouselAI <onboarding@resend.dev>",
      to: email,
      subject: isLtd ? "You now own CarouselAI Pro — forever 🎉" : "Welcome to CarouselAI Pro 🚀",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 16px;">
          <p style="color: #c084fc; font-weight: 700; letter-spacing: 2px; font-size: 12px; text-transform: uppercase; margin-bottom: 16px;">CarouselAI</p>
          <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 16px;">${isLtd ? "You own it. Forever. 🎉" : "Welcome to Pro 🚀"}</h1>
          <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            ${isLtd
              ? "Your lifetime license is active. Unlimited carousels, PDF export, no watermark, and the LinkedIn Post generator — all unlocked, no subscription, no renewals."
              : "Your account is upgraded. Unlimited carousels, PDF export, no watermark, and the LinkedIn Post generator are all unlocked."
            }
          </p>
          <a href="https://www.aicarousel.tech/create" style="display: inline-block; background: #c026d3; color: #fff; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 12px;">
            Start creating →
          </a>
          <p style="color: #52525b; font-size: 12px; margin-top: 32px;">
            Questions? Just reply to this email.
          </p>
        </div>
      `,
    })
  } catch (e) {
    console.error("Failed to send welcome email:", e)
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (e) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_email
    const plan = session.metadata?.plan || "pro_monthly"
    const isLtd = plan === "ltd"

    if (email) {
      await supabase
        .from("generation_counts")
        .upsert({ email, is_pro: true, plan }, { onConflict: "email" })

      await sendWelcomeEmail(email, isLtd)
    }
  }

  return NextResponse.json({ received: true })
}