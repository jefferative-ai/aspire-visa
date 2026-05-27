import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";
import type { FullReport } from "@/lib/ai/report-generator";

async function getReport(id: string) {
  try {
    const screening = await db.screening.findUnique({
      where: { id },
      select: {
        id: true,
        report: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    });
    return screening;
  } catch {
    return null;
  }
}

function StatusBadge({ status }: { status: FullReport["status"] }) {
  const config: Record<
    FullReport["status"],
    { label: string; classes: string; dotColor: string }
  > = {
    ELIGIBLE: {
      label: "Eligible",
      classes:
        "bg-green-50 border border-green-200 text-[var(--success)]",
      dotColor: "bg-[var(--success)]",
    },
    CONDITIONAL: {
      label: "Conditionally Eligible",
      classes:
        "bg-amber-50 border border-amber-200 text-[var(--warning)]",
      dotColor: "bg-[var(--warning)]",
    },
    NOT_ELIGIBLE: {
      label: "Not Currently Eligible",
      classes:
        "bg-red-50 border border-red-200 text-[var(--danger)]",
      dotColor: "bg-[var(--danger)]",
    },
  };
  const c = config[status];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-base font-bold",
        c.classes
      )}
    >
      <span className={cn("w-2.5 h-2.5 rounded-full", c.dotColor)} />
      {c.label}
    </div>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const screening = await getReport(id);

  if (!screening) notFound();

  const isPaid =
    screening.paymentStatus === "MOCK_SUCCESS" ||
    screening.paymentStatus === "PAID";

  if (!isPaid) {
    return (
      <div className="min-h-dvh bg-[var(--bg)] flex flex-col items-center justify-center px-6 gap-6 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-1)]">
          Report locked
        </h1>
        <p className="text-[var(--text-2)] max-w-sm">
          Please complete payment to access your full eligibility report.
        </p>
        <Link
          href={`/screening/payment/${id}`}
          className="inline-flex items-center justify-center h-12 px-8 bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
        >
          Unlock Report - $7
        </Link>
      </div>
    );
  }

  if (!screening.report) {
    return (
      <div className="min-h-dvh bg-[var(--bg)] flex flex-col items-center justify-center px-6 gap-6 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-1)]">
          Report not ready yet
        </h1>
        <p className="text-[var(--text-2)] max-w-sm">
          Your report is still being generated. Please check back in a moment.
        </p>
        <Link
          href={`/screening/paid?screeningId=${id}`}
          className="inline-flex items-center justify-center h-12 px-8 bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
        >
          Continue Screening
        </Link>
      </div>
    );
  }

  let report: FullReport;
  try {
    report = JSON.parse(screening.report) as FullReport;
  } catch {
    notFound();
  }

  const showConsultation =
    report.status === "ELIGIBLE" || report.status === "CONDITIONAL";

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
        <div className="flex items-center gap-3">
          <a
            href={`/api/report/${id}/pdf`}
            className="text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors border border-[var(--border)] rounded-lg px-3 py-1.5"
          >
            Download PDF
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col gap-10">
        {/* Status */}
        <section className="flex flex-col gap-4">
          <StatusBadge status={report.status} />
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-1)] leading-tight">
            {report.summary.headline}
          </h1>
          <p className="text-[var(--text-2)] leading-relaxed text-base">
            {report.summary.plain_language_explanation}
          </p>
          <p className="text-xs text-[var(--text-3)]">
            Confidence level:{" "}
            <span className="font-medium">{report.eligibility.confidence_level}</span>
          </p>
        </section>

        {/* Hard blocks */}
        {report.eligibility.hard_blocks.length > 0 && (
          <section className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-[var(--danger)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h2 className="font-bold text-[var(--danger)] text-base">
                Hard Blocks
              </h2>
            </div>
            <p className="text-xs text-red-600 opacity-80">
              These are absolute barriers that must be resolved before any
              application can proceed.
            </p>
            <ul className="flex flex-col gap-3">
              {report.eligibility.hard_blocks.map((block, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-red-700"
                >
                  <span className="mt-0.5 w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-red-100 text-red-500 text-xs font-bold">
                    !
                  </span>
                  {block}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Risk flags */}
        {report.eligibility.risk_flags.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-[var(--warning)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="font-bold text-[var(--warning)] text-base">
                Risk Flags
              </h2>
            </div>
            <p className="text-xs text-amber-600 opacity-80">
              These factors may reduce your chances of approval. Address them
              before or during your application.
            </p>
            <ul className="flex flex-col gap-3">
              {report.eligibility.risk_flags.map((flag, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-amber-700"
                >
                  <span className="mt-0.5 w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-100 text-amber-500 text-xs font-bold">
                    ▲
                  </span>
                  {flag}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Document checklist */}
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-6">
          <h2 className="font-bold text-[var(--text-1)] text-lg">
            Document Checklist
          </h2>

          {report.checklist.required_documents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-widest mb-3">
                Required documents
              </h3>
              <ul className="flex flex-col gap-2.5">
                {report.checklist.required_documents.map((doc, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-[var(--text-1)]"
                  >
                    <svg
                      className="w-4 h-4 text-[var(--success)] shrink-0"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                    </svg>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.checklist.missing_items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-widest mb-3">
                Missing items
              </h3>
              <ul className="flex flex-col gap-2.5">
                {report.checklist.missing_items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-[var(--danger)]"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.checklist.optional_strengtheners.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-widest mb-3">
                Optional strengtheners
              </h3>
              <ul className="flex flex-col gap-2.5">
                {report.checklist.optional_strengtheners.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-[var(--text-2)]"
                  >
                    <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-3)] text-xs">
                      +
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Visa tracks */}
        {report.recommendations.primary_visa_tracks.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-bold text-[var(--text-1)] text-lg">
              Recommended Visa Tracks
            </h2>
            <div className="flex flex-col gap-3">
              {report.recommendations.primary_visa_tracks.map((track, i) => (
                <div
                  key={i}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-[var(--text-1)] text-base">
                      {track.country}
                    </p>
                    <p className="text-sm text-[var(--text-2)] mt-0.5">
                      {track.visa_category}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xl font-black text-[var(--text-1)]">
                      {track.score}
                      <span className="text-xs font-normal text-[var(--text-3)]">/100</span>
                    </span>
                    <span className="text-xs text-[var(--text-3)]">
                      profile match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Alternative tracks */}
        {report.recommendations.alternative_visa_tracks.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-bold text-[var(--text-1)] text-base">
              Alternative Tracks to Consider
            </h2>
            <div className="flex flex-col gap-3">
              {report.recommendations.alternative_visa_tracks.map((track, i) => (
                <div
                  key={i}
                  className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4"
                >
                  <p className="font-medium text-[var(--text-1)] text-sm">
                    {track.country} - {track.visa_category}
                  </p>
                  <p className="text-xs text-[var(--text-2)] mt-1">{track.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Improvement steps */}
        {report.improvement_steps.length > 0 && (
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-bold text-[var(--text-1)] text-lg">
              Improvement Steps
            </h2>
            <ol className="flex flex-col gap-4">
              {report.improvement_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--text-1)] text-[var(--accent-fg)] text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[var(--text-2)] leading-relaxed pt-1">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Next actions message */}
        {report.next_actions.message && (
          <section className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5">
            <p className="text-sm text-[var(--text-2)] leading-relaxed">
              <span className="font-semibold text-[var(--text-1)]">
                What to do next:{" "}
              </span>
              {report.next_actions.message}
            </p>
          </section>
        )}

        {/* Consultation CTA */}
        {showConsultation && (
          <section className="bg-[var(--text-1)] text-[var(--accent-fg)] rounded-2xl p-8 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-2">
                Expert consultation
              </p>
              <h2 className="text-2xl font-bold">
                Book a 1-hour consultation
              </h2>
              <p className="mt-2 text-sm opacity-80 leading-relaxed">
                Speak with a Nordic visa specialist about your specific case.
                We will review your documents, assess your chances, and give
                you a step-by-step application plan.
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                className="inline-flex items-center justify-center h-12 px-8 bg-[var(--accent-fg)] text-[var(--accent)] font-bold rounded-xl hover:bg-[var(--surface-hover)] transition-colors text-sm cursor-pointer"
              >
                Book Consultation - $70
              </button>
              <span className="text-xs opacity-50">Via email / Calendly</span>
            </div>
          </section>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <a
            href={`/api/report/${id}/pdf`}
            className="inline-flex items-center gap-2 h-11 px-6 bg-[var(--surface)] text-[var(--text-1)] font-medium text-sm rounded-xl border border-[var(--border)] hover:border-[var(--text-2)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z" />
              <path d="M7.646 11.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L5.354 8.146a.5.5 0 10-.708.708l3 3z" />
            </svg>
            Download PDF
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent("My Aspire Visa Pro Report")}&body=${encodeURIComponent(`Hi,\n\nHere is my Aspire Visa Pro eligibility report.\n\nReport ID: ${id}\nStatus: ${report.status}\n\nView report: ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/screening/report/${id}`)}`}
            className="inline-flex items-center gap-2 h-11 px-6 bg-[var(--surface)] text-[var(--text-1)] font-medium text-sm rounded-xl border border-[var(--border)] hover:border-[var(--text-2)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M.05 3.555A2 2 0 012 2h12a2 2 0 011.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 002 14h12a2 2 0 001.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z" />
            </svg>
            Email this report
          </a>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col gap-1">
          <p className="text-xs text-[var(--text-3)]">
            Generated on {formatDate(report.generated_at)}. Valid for 90 days
            (until {formatDate(report.expires_at)}).
          </p>
          <p className="text-xs text-[var(--text-3)]">
            Advisory only. This report does not constitute legal advice and
            does not guarantee visa approval. Report ID: {report.report_id}.
          </p>
        </div>
      </main>
    </div>
  );
}
