import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aspire Visa Pro - Know Before You Apply",
  description:
    "Precise Nordic visa eligibility screening for Nigerian applicants. Get a structured, honest assessment in 15 minutes.",
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg)]">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[var(--border)]">
        <span className="font-bold text-[var(--text-1)] tracking-tight text-lg">
          Aspire Visa Pro
        </span>
        <Link
          href="/login"
          className="text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-36 max-w-4xl mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--text-2)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            Free 15-minute screening - no account required
          </div>

          <h1 className="text-[clamp(36px,7vw,80px)] font-extrabold text-[var(--text-1)] leading-[1.05] tracking-tight mb-6">
            Know before
            <br />
            you apply.
          </h1>

          <p className="text-[clamp(17px,2.5vw,22px)] text-[var(--text-2)] leading-relaxed max-w-xl mb-12">
            Precise, personalised Nordic visa eligibility screening for Nigerians. Get
            honest, structured guidance on Denmark, Norway, Sweden, Finland, and
            more - before spending time or money on applications.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/screening/free"
              className="inline-flex items-center justify-center h-14 px-9 bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-base rounded-2xl hover:bg-[var(--accent-hover)] transition-colors"
            >
              Start Free Screening
            </Link>
          </div>

          <p className="mt-6 text-sm text-[var(--text-3)]">
            No credit card required for the free screening.
          </p>
        </section>

        {/* Feature cards */}
        <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto w-full">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "📋",
                title: "Free 15-min screening",
                description:
                  "Answer structured questions about your profile. No account needed. Takes about 15 minutes.",
              },
              {
                icon: "📄",
                title: "Detailed eligibility report",
                description:
                  "Our screening engine cross-references your answers against Nordic visa requirements to produce a structured, personalised eligibility report.",
              },
              {
                icon: "🎯",
                title: "Honest guidance",
                description:
                  "We tell you what the embassies look for — hard blocks, risk flags, missing documents, and actionable improvement steps.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7"
              >
                <span className="text-2xl mb-5 block">{card.icon}</span>
                <h3 className="font-bold text-[var(--text-1)] text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-[var(--text-2)] text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 md:px-12 pb-28 max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-[var(--text-1)] mb-10 text-center">
            How it works
          </h2>
          <ol className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", label: "Free screening", desc: "~15 questions about you and your goals." },
              { step: "02", label: "Free preview", desc: "Instant snapshot of visa tracks and documents needed." },
              { step: "03", label: "Unlock full report", desc: "Pay $7 to complete the deep assessment - 60+ questions." },
              { step: "04", label: "Act on it", desc: "Download your report, book a consultation, or apply yourself." },
            ].map((item) => (
              <li key={item.step} className="flex flex-col gap-2">
                <span className="text-4xl font-black text-[var(--border)]">
                  {item.step}
                </span>
                <h3 className="font-semibold text-[var(--text-1)]">{item.label}</h3>
                <p className="text-sm text-[var(--text-2)] leading-relaxed">{item.desc}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span className="font-bold text-[var(--text-1)] text-sm">Aspire Visa Pro</span>
          <p className="text-xs text-[var(--text-3)] max-w-lg leading-relaxed">
            This service provides advisory guidance only and does not constitute
            legal advice. Eligibility assessments do not guarantee visa approval.
            Always verify requirements directly with the relevant embassy or
            immigration authority.
          </p>
        </div>
      </footer>
    </div>
  );
}
