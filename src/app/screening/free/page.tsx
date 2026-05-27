"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScreeningShell } from "@/components/screening/ScreeningShell";
import { getVisibleFreeQuestions, FREE_SECTIONS } from "@/lib/questions";
import type { ScreeningAnswers } from "@/lib/questions/types";

const STORAGE_KEY = "avp_free_answers";

export default function FreeScreeningPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<ScreeningAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const transitioning = useRef(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ScreeningAnswers;
        setAnswers(parsed);
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

  const visibleQuestions = getVisibleFreeQuestions(answers);

  const currentQuestion = visibleQuestions[currentIndex];

  // Check for hard block on current answer
  useEffect(() => {
    if (!currentQuestion?.hardBlockIf) {
      setBlockMessage(null);
      return;
    }
    const block = currentQuestion.hardBlockIf(answers);
    setBlockMessage(block);
  }, [currentQuestion, answers]);

  const getSectionLabel = () => {
    if (!currentQuestion) return "";
    const section = FREE_SECTIONS.find((s) => s.id === currentQuestion.section);
    return section?.label ?? currentQuestion.section;
  };

  const handleAnswer = useCallback(
    (storesAs: string, value: unknown) => {
      setAnswers((prev) => ({ ...prev, [storesAs]: value }));
    },
    []
  );

  const handleNext = useCallback(async () => {
    if (blockMessage) return;
    if (transitioning.current) return;
    transitioning.current = true;
    // Release the lock after the spring animation (≈ 350 ms)
    setTimeout(() => { transitioning.current = false; }, 400);

    if (currentIndex < visibleQuestions.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      return;
    }

    // Last question - submit
    setSubmitting(true);
    try {
      // Build email from answers or use a placeholder
      const email =
        (answers.email as string) ||
        `anon_${Date.now()}@aspirevisapro.app`;

      const startRes = await fetch("/api/screening/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, freeAnswers: answers }),
      });

      if (!startRes.ok) {
        const err = await startRes.json();
        alert(err.error || "Failed to start screening. Please try again.");
        return;
      }

      const { screeningId } = await startRes.json();

      const previewRes = await fetch(
        `/api/screening/${screeningId}/preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!previewRes.ok) {
        // Still redirect even if preview generation fails
        router.push(`/screening/preview/${screeningId}`);
        return;
      }

      // Clear stored answers
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/screening/preview/${screeningId}`);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [blockMessage, currentIndex, visibleQuestions.length, answers, router]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  if (submitting) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--bg)] gap-4">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
        <p className="text-[var(--text-2)] text-base">
          Analysing your answers…
        </p>
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
