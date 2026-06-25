export const metadata = {
  title: "Privacy Policy — CarouselAI",
};

export default function Privacy() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <a href="/" className="text-sm text-zinc-500 hover:text-white transition">← Back to CarouselAI</a>
        <h1 className="text-4xl font-black mt-6 mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-12">Last updated: June 25, 2026</p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">What we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your name and email address, from Google or GitHub when you sign in.</li>
              <li>The text, ideas, or articles you submit to generate a carousel, and the carousels we generate for you.</li>
              <li>Usage data: how many carousels you've generated and when, so we can enforce the free-tier monthly limit.</li>
              <li>Payment information, handled entirely by Stripe — we never see or store your full card number.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">How we use it</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To generate your carousels and let you export them.</li>
              <li>To enforce the Free plan's monthly limit and to recognize Pro subscribers.</li>
              <li>To send you transactional emails related to your account or subscription (e.g. payment receipts via Stripe).</li>
            </ul>
            <p className="mt-3">We do not sell your data, and we do not use the content you submit to train any AI model.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Third parties we use</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">OpenAI</strong> — processes the text you submit to generate carousel content. Per OpenAI's API terms, data sent via their API is not used to train their models.</li>
              <li><strong className="text-white">Stripe</strong> — processes payments. CarouselAI never receives or stores your raw card details.</li>
              <li><strong className="text-white">Supabase</strong> — stores your account record (email, usage count, subscription status).</li>
              <li><strong className="text-white">Google / GitHub</strong> — used only for sign-in (OAuth). We receive your name and email, nothing else from these accounts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Cookies</h2>
            <p>We use a session cookie (via NextAuth) to keep you signed in. We don't use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Data retention &amp; deletion</h2>
            <p>We keep your account data for as long as your account is active. To request deletion of your account and associated data, email us (see Contact below) and we'll remove it within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
            <p>Questions about this policy? Email <a href="mailto:22vp222.0@gmail.com" className="text-purple-400 hover:underline">22vp222.0@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
