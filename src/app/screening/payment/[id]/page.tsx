"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { cn } from "@/lib/utils";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!consent) {
      setError("Please read and accept the advisory disclaimer before continuing.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/screening/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to process. Please try again.");
        return;
      }

      router.push(`/screening/paid?screeningId=${id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--bg)] flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[var(--border)]">
        <Link
          href="/"
          className="font-bold text-[var(--text-1)] tracking-tight text-lg"
        >
          Aspire Visa Pro
        </Link>
        <Link
          href={`/screening/preview/${id}`}
          className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
        >
          ← Back to preview
        </Link>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-14 flex flex-col gap-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-[var(--success)] text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            Beta — Free Access
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-1)] mb-2">
            Unlock Your Full Report
          </h1>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-extrabold text-[var(--text-1)]">Free</span>
            <span className="text-[var(--text-2)] text-sm line-through">$7 at launch</span>
          </div>
        </div>

        {/* What's included */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-widest mb-4">
            What you get
          </h2>
          <ul className="flex flex-col gap-3">
            {[
              "60+ detailed eligibility questions",
              "Official eligibility verdict with reasoning",
              "Full document checklist with what's missing",
              "Ranked visa tracks for your profile",
              "Numbered improvement action plan",
              "Downloadable report valid for 90 days",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-[var(--text-2)]"
              >
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0 text-[var(--success)]"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Beta access note */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-widest mb-3">
            Beta Access
          </h2>
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--text-2)] leading-relaxed">
            <p className="font-medium text-[var(--text-1)] mb-1">
              No payment required during beta
            </p>
            <p>
              We are integrating Paystack and Flutterwave for Nigerian applicants.
              During beta, full access is free. The report will be priced at $7 at launch.
            </p>
            <p className="mt-2">
              Questions? Email{" "}
              <a
                href="mailto:hello@aspirevisapro.com"
                className="underline underline-offset-2 hover:opacity-70"
              >
                hello@aspirevisapro.com
              </a>
            </p>
          </div>
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 cursor-pointer">
          <button
            type="button"
            role="checkbox"
            aria-checked={consent}
            onClick={() => setConsent((v) => !v)}
            className={cn(
              "mt-0.5 w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors",
              consent
                ? "bg-[var(--accent)] border-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            )}
          >
            {consent && (
              <svg
                className="w-3 h-3 text-[var(--accent-fg)]"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M10.28 2.28a.75.75 0 00-1.06 0L4.5 7 3.78 6.28a.75.75 0 00-1.06 1.06l1 1a.75.75 0 001.06 0l5.5-5.5a.75.75 0 000-1.06z" />
              </svg>
            )}
          </button>
          <span className="text-sm text-[var(--text-2)] leading-relaxed">
            I understand this assessment{" "}
            <strong className="text-[var(--text-1)]">
              does not guarantee visa approval
            </strong>
            . This is advisory guidance only. I will verify all requirements
            with the relevant embassy before applying.
          </span>
        </label>

        {error && (
          <p className="text-sm text-[var(--danger)]">{error}</p>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading || !consent}
          className={cn(
            "w-full h-14 rounded-xl font-bold text-base",
            "transition-all duration-150 cursor-pointer",
            !consent
              ? "bg-[var(--border)] text-[var(--text-3)] cursor-not-allowed"
              : loading
              ? "bg-[var(--border)] text-[var(--text-3)] cursor-not-allowed"
              : "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
          )}
        >
          {loading ? "Processing…" : "Get Full Report →"}
        </button>

        <p className="text-xs text-center text-[var(--text-3)]">
          Free during beta. $7 at launch. No subscription, ever.
        </p>
      </main>
    </div>
  );
}
