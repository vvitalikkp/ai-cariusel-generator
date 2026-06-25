export const metadata = {
  title: "Terms of Service — CarouselAI",
};

export default function Terms() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <a href="/" className="text-sm text-zinc-500 hover:text-white transition">← Back to CarouselAI</a>
        <h1 className="text-4xl font-black mt-6 mb-2">Terms of Service</h1>
        <p className="text-zinc-500 text-sm mb-12">Last updated: June 25, 2026</p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">The service</h2>
            <p>CarouselAI generates LinkedIn carousel content from text, ideas, or articles you provide, using AI. You're responsible for reviewing and editing generated content before posting it anywhere — we don't guarantee accuracy of any facts, statistics, or claims the AI produces.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Plans &amp; billing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Free</strong>: 3 carousels per calendar month, PNG export, watermarked.</li>
              <li><strong className="text-white">Pro</strong>: $24/month or $19/month billed annually, unlimited carousels, PNG + PDF export, no watermark. Billed automatically on a recurring basis until you cancel.</li>
              <li>You can cancel anytime; cancellation stops future billing, but we don't provide refunds for the current billing period already paid for.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Your content</h2>
            <p>You own what you generate with CarouselAI and may use it however you like, including commercially. You're responsible for making sure you have the right to submit any text or ideas you paste in (e.g. don't submit someone else's copyrighted article and claim it as your own carousel).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Acceptable use</h2>
            <p>Don't use CarouselAI to generate spam, harassment, illegal content, or content designed to mislead. We may suspend accounts that abuse the service, including attempts to bypass usage limits.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">No warranty</h2>
            <p>CarouselAI is provided "as is." We don't guarantee the service will be uninterrupted, error-free, or that generated content will perform well or "go viral" on LinkedIn or anywhere else.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Changes</h2>
            <p>We may update these terms or our pricing as the product evolves. We'll post changes here; continued use after a change means you accept the updated terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
            <p>Questions? Email <a href="mailto:22vp222.0@gmail.com" className="text-purple-400 hover:underline">22vp222.0@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
