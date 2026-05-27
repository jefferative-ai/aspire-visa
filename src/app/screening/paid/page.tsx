"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreeningShell } from "@/components/screening/ScreeningShell";
import { getVisiblePaidQuestions, PAID_SECTIONS } from "@/lib/questions";
import type { ScreeningAnswers } from "@/lib/questions/types";

const STORAGE_KEY = "avp_paid_answers";

function PaidScreeningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const screeningId = searchParams.get("screeningId");

  const [answers, setAnswers] = useState<ScreeningAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [blockMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
