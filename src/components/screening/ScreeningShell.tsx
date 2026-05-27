"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import type { Question } from "@/lib/questions/types";

interface ScreeningShellProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, unknown>;
  onAnswer: (storesAs: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
  direction: 1 | -1; // 1 = forward, -1 = backward
  sectionLabel?: string;
  blockMessage?: string | null;
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "40%" : "-40%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-40%" : "40%",
    opacity: 0,
  }),
};

export function ScreeningShell({
  questions,
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onBack,
  direction,
  sectionLabel,
  blockMessage,
}: ScreeningShellProps) {
  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0
      ? ((currentIndex + 1) / questions.length) * 100
      : 0;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!currentQuestion) return;

      // Enter → advance (for non-option types or when value is set)
      if (e.key === "Enter") {
        const val = answers[currentQuestion.storesAs];
        const type = currentQuestion.type;
        // single/yesno auto-advance; multi needs Continue button; others use Enter
        if (
          type === "text" ||
          type === "number" ||
          type === "date" ||
          type === "dropdown"
        ) {
          // The input itself handles Enter; no double-fire needed here
          return;
        }
      }

      // Backspace on an empty input → go back
      if (e.key === "Backspace") {
        const active = document.activeElement as HTMLElement | null;
        const isInput =
          active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";
        if (!isInput) {
          onBack();
        }
      }
    },
    [currentQuestion, answers, onBack]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!currentQuestion) return null;

  return (
    <div className="screening-page relative overflow-x-hidden w-full min-h-dvh">
      <ProgressBar
        progress={progress}
        sectionLabel={sectionLabel}
        currentQuestion={currentIndex + 1}
        totalQuestions={questions.length}
      />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQuestion.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="flex-1 flex flex-col w-full"
        >
          <QuestionCard
            question={currentQuestion}
            value={answers[currentQuestion.storesAs] ?? ""}
            onChange={(v) => onAnswer(currentQuestion.storesAs, v)}
            onNext={onNext}
            onBack={onBack}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            blockMessage={blockMessage}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
