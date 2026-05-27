import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

interface PreviewData {
  suggested_tracks: string[];
  what_you_need_next: string[];
  cta: string;
  disclaimer: string;
}

async function getScreening(id: string) {
  try {
    const screening = await db.screening.findUnique({
      where: { id },
      select: {
        id: true,
        freePreview: true,
        status: true,
        paymentStatus: true,
      },
    });
    return screening;
  } catch {
    return null;
  }
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const screening = await getScreening(id);

  if (!screening) notFound();

  let preview: PreviewData | null = null;
  if (screening.freePreview) {
    try {
      preview = JSON.parse(screening.freePreview) as PreviewData;
    } catch {
      // leave null
    }
  }

  const isPaid =
    screening.paymentStatus === "MOCK_SUCCESS" ||
    screening.paymentStatus === "PAID";

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
        <span className="text-xs font-medium text-[var(--text-3)] bg-[var(--surface)] border border-[var(--border)] rounded-full px-3 py-1">
          Free Preview
        </span>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-14 flex flex-col gap-10">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)] mb-3">
            Based on your answers
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-1)] leading-tight">
            Here's your eligibility snapshot.
          </h1>
          <p className="mt-3 text-[var(--text-2)] leading-relaxed">
            This is a high-level preview. Unlock the full report for a complete
            assessment with specific documents, risk flags, and improvement steps.
          </p>
        </div>

        {/* Suggested visa tracks — the reveal moment */}
        {preview?.suggested_tracks && preview.suggested_tracks.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)] mb-4">
              Your best-fit visa tracks
            </p>
            <div className="flex flex-col gap-3">
              {preview.suggested_tracks.map((track, i) => (
                <div
                  key={track}
                  className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-5 py-4"
                >
                  <span className="w-7 h-7 flex-shrink-0 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-base font-semibold text-[var(--text-1)]">{track}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* What you'll need */}
        {preview?.what_you_need_next && preview.what_you_need_next.length > 0 && (
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[var(--text-1)] mb-4">
              What you will need
            </h2>
            <ul className="flex flex-col gap-3">
              {preview.what_you_need_next.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-2)]">
                  <span className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--bg)] border border-[var(--border)] text-xs font-bold text-[var(--text-3)]">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Paywall CTA */}
        {!isPaid && (
          <section className="bg-[var(--text-1)] text-[var(--accent-fg)] rounded-2xl p-8 flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-2">
                Full Report
              </p>
              <h2 className="text-2xl font-bold leading-snug">
                {preview?.cta ||
                  "Get your full eligibility report to see exactly what you need and your chances of approval."}
              </h2>
            </div>

            <ul className="text-sm opacity-80 flex flex-col gap-2">
              {[
                "Detailed eligibility verdict (ELIGIBLE / CONDITIONAL / NOT ELIGIBLE)",
                "Hard blocks and risk flags explained",
                "Full document checklist with missing items",
                "Improvement steps ranked by impact",
                "Recommended visa tracks with approval scores",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href={`/screening/payment/${id}`}
                className="inline-flex items-center justify-center h-14 px-8 bg-[var(--accent-fg)] text-[var(--accent)] font-bold text-base rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
              >
                Get Your Full Report - $7
              </Link>
              <span className="text-xs opacity-50">
                One-time payment. No subscription.
              </span>
            </div>
          </section>
        )}

        {/* If already paid, go to paid screening */}
        {isPaid && (
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[var(--text-1)]">
              Payment confirmed
            </h2>
            <p className="text-[var(--text-2)] text-sm">
              You have already unlocked the full screening. Continue to complete
              your detailed assessment.
            </p>
            <Link
              href={`/screening/paid?screeningId=${id}`}
              className="self-start inline-flex items-center justify-center h-12 px-8 bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-base rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
            >
              Continue to Full Screening
            </Link>
          </section>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-[var(--text-3)] leading-relaxed">
          {preview?.disclaimer ||
            "This preview is informational only and does not constitute legal advice."}
          {" "}Results are based solely on your self-reported answers and are not
          verified by any government body.
        </p>
      </main>
    </div>
  );
}
