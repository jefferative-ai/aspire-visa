"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreeningShell } from "@/components/screening/ScreeningShell";
import { getVisiblePaidQuestions, PAID_SECTIONS } from "@/lib/questions";
import type { ScreeningAnswers } from "@/lib/questions/types";

const STORAGE_KEY = "avp_paid_answers";

const SECTION_ICONS: Record<string, string> = {
  B1: "🪪",
  B2: "💳",
  B3: "🎓",
  B4: "💼",
  B5: "👪",
  B6: "✈️",
  B7: "🏥",
  B8: "📋",
  B9: "✅",
};

function PaidIntroScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="min-h-dvh bg-[var(--bg)] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[var(--border)]">
        <span className="font-bold text-[var(--text-1)] tracking-tight text-lg">Aspire Visa Pro</span>
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-3)]">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[var(--success)] text-[var(--bg)] text-[10px] font-bold flex items-center justify-center">✓</span>
            Free Screening
          </span>
          <span className="text-[var(--border)]">—</span>
          <span className="flex items-center gap-1.5 text-[var(--text-1)]">
            <span className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-fg)]" />
            </span>
            Detailed Assessment
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)] mb-3">
            Part 2 of 2
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-1)] leading-tight mb-3">
            Detailed Assessment
          </h1>
          <p className="text-[var(--text-2)] text-base leading-relaxed max-w-lg">
            These questions let us assess your full eligibility across documents, finances, employment, and more. Takes about 10 minutes.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PAID_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center gap-2.5"
            >
              <span className="text-base leading-none">{SECTION_ICONS[section.id]}</span>
              <span className="text-sm font-medium text-[var(--text-2)]">{section.label}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onBegin}
          className="self-start inline-flex items-center gap-2 h-14 px-8 bg-[var(--accent)] text-[var(--accent-fg)] font-bold text-base rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
        >
          Begin Assessment
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <p className="text-xs text-[var(--text-3)]">
          Your answers are saved automatically. You can pause and return at any time.
        </p>
      </main>
    </div>
  );
}

function PaidScreeningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const screeningId = searchParams.get("screeningId");

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<ScreeningAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [blockMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const transitioning = useRef(false);

  // Restore from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAnswers(JSON.parse(stored) as ScreeningAnswers);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist answers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers]);

  const visibleQuestions = getVisiblePaidQuestions(answers);
  const currentQuestion = visibleQuestions[currentIndex];

  const getSectionLabel = () => {
    if (!currentQuestion) return "";
    const section = PAID_SECTIONS.find((s) => s.id === currentQuestion.section);
    return section?.label ?? currentQuestion.section;
  };

  const handleAnswer = useCallback((storesAs: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [storesAs]: value }));
  }, []);

  const handleNext = useCallback(async () => {
    if (blockMessage) return;
    if (transitioning.current) return;
    transitioning.current = true;
    setTimeout(() => { transitioning.current = false; }, 400);

    if (currentIndex < visibleQuestions.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      return;
    }

    // Last question - submit
    if (!screeningId) {
      alert("Screening ID missing. Please restart.");
      router.push("/");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/screening/${screeningId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidAnswers: answers }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate report. Please try again.");
        return;
      }

      localStorage.removeItem(STORAGE_KEY);
      router.push(`/screening/report/${screeningId}`);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [blockMessage, currentIndex, visibleQuestions.length, screeningId, answers, router]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  if (!screeningId) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--bg)] gap-4 px-6 text-center">
        <h1 className="text-xl font-bold text-[var(--text-1)]">
          No active screening found
        </h1>
        <p className="text-[var(--text-2)] text-sm">
          Please start from the beginning.
        </p>
        <a
          href="/screening/free"
          className="mt-4 inline-flex items-center justify-center h-11 px-7 bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-sm"
        >
          Start Free Screening
        </a>
      </div>
    );
  }

  if (!started) {
    return <PaidIntroScreen onBegin={() => setStarted(true)} />;
  }

  if (submitting) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--bg)] gap-4">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
        <p className="text-[var(--text-2)] text-base">Generating your report…</p>
        <p className="text-[var(--text-3)] text-sm">This may take up to 30 seconds.</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)]">
        <p className="text-[var(--text-2)]">Loading questions…</p>
      </div>
    );
  }

  return (
    <ScreeningShell
      questions={visibleQuestions}
      currentIndex={currentIndex}
      answers={answers}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onBack={handleBack}
      direction={direction}
      sectionLabel={getSectionLabel()}
      blockMessage={blockMessage}
    />
  );
}

export default function PaidScreeningPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)]">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      }
    >
      <PaidScreeningContent />
    </Suspense>
  );
}
