"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ProgressBarProps {
  progress: number; // 0–100
  sectionLabel?: string;
  currentQuestion?: number;
  totalQuestions?: number;
}

export function ProgressBar({
  progress,
  sectionLabel,
  currentQuestion,
  totalQuestions,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const motivationalSuffix =
    clampedProgress >= 90
      ? "Almost done!"
      : clampedProgress >= 60
        ? "More than halfway!"
        : clampedProgress >= 30
          ? "Good going"
          : null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]">
      {/* Header row: section label left, question counter right */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionLabel}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-0.5"
          >
            <span className="text-[10px] font-semibold text-[var(--text-3)] tracking-[0.15em] uppercase leading-none">
              {sectionLabel ?? "Screening"}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Question counter */}
        {currentQuestion != null && totalQuestions != null && (
          <div className="flex items-center gap-2">
            {motivationalSuffix && (
              <motion.span
                key={motivationalSuffix}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:block text-[11px] font-medium text-[var(--success)]"
              >
                {motivationalSuffix}
              </motion.span>
            )}
            <span className="text-xs font-semibold text-[var(--text-2)] tabular-nums">
              {currentQuestion}
              <span className="text-[var(--text-3)] font-normal"> / {totalQuestions}</span>
            </span>
          </div>
        )}
      </div>

      {/* Progress track - 5px on mobile, feels substantial */}
      <div className="h-1.5 w-full bg-[var(--border)]">
        <motion.div
          className="h-full bg-[var(--accent)] origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: clampedProgress / 100 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}
