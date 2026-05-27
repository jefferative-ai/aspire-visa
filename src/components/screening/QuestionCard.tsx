"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Question, QuestionOption } from "@/lib/questions/types";

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function TextInput({
  question,
  value,
  onChange,
  onNext,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Delay focus slightly so framer-motion animation doesn't swallow it
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <input
      ref={inputRef}
      type={question.type === "number" ? "number" : question.type === "date" ? "date" : "text"}
      value={value}
      placeholder={question.placeholder ?? "Type your answer…"}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onNext();
        }
      }}
      min={question.validation?.min}
      max={question.validation?.max}
      minLength={question.validation?.minLength}
      maxLength={question.validation?.maxLength}
      className={cn(
        "w-full bg-[var(--surface)] rounded-xl border-2 border-[var(--border)]",
        "focus:border-[var(--text-1)] outline-none appearance-none",
        "text-[var(--text-1)] text-2xl md:text-3xl font-medium",
        "placeholder:text-[var(--text-3)] px-5 py-4 transition-colors"
      )}
    />
  );
}

function YesNoInput({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const select = (v: string) => {
    onChange(v);
    setTimeout(onNext, 300);
  };

  return (
    <div className="flex gap-4 flex-wrap">
      {(["yes", "no"] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => select(opt)}
          className={cn(
            "flex-1 min-w-[120px] h-14 rounded-2xl border-2 text-lg font-semibold",
            "transition-all duration-150 cursor-pointer",
            value === opt
              ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]"
              : "bg-[var(--surface)] text-[var(--text-1)] border-[var(--border)] hover:border-[var(--text-2)] hover:bg-[var(--surface-hover)]"
          )}
        >
          {opt === "yes" ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

function SingleSelect({
  options,
  value,
  onChange,
  onNext,
}: {
  options: QuestionOption[];
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const select = (v: string) => {
    onChange(v);
    setTimeout(onNext, 400);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => select(opt.value)}
          className={cn(
            "w-full text-left px-5 py-4 rounded-xl border-2 text-base font-medium",
            "transition-all duration-150 cursor-pointer",
            value === opt.value
              ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]"
              : "bg-[var(--surface)] text-[var(--text-1)] border-[var(--border)] hover:border-[var(--text-2)] hover:bg-[var(--surface-hover)]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
  onNext,
}: {
  options: QuestionOption[];
  value: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
}) {
  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {options.map((opt) => {
        const checked = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              "w-full text-left px-5 py-4 rounded-xl border-2 text-base font-medium",
              "flex items-center gap-3",
              "transition-all duration-150 cursor-pointer",
              checked
                ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]"
                : "bg-[var(--surface)] text-[var(--text-1)] border-[var(--border)] hover:border-[var(--text-2)] hover:bg-[var(--surface-hover)]"
            )}
            aria-pressed={checked}
          >
            <span
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center",
                checked
                  ? "bg-[var(--accent-fg)] border-[var(--accent-fg)]"
                  : "border-[var(--border)]"
              )}
            >
              {checked && (
                <svg className="w-3 h-3 text-[var(--accent)]" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M10.28 2.28a.75.75 0 00-1.06 0L4.5 7l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06z" />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        );
      })}

      {value.length > 0 && (
        <button
          type="button"
          onClick={onNext}
          className={cn(
            "mt-2 self-start px-7 py-3 rounded-xl border-2",
            "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]",
            "text-base font-semibold",
            "transition-all duration-150 cursor-pointer hover:bg-[var(--accent-hover)]"
          )}
        >
          Continue
          <span className="ml-2 opacity-60 text-sm">↵</span>
        </button>
      )}
    </div>
  );
}

function DropdownSearch({
  options,
  value,
  onChange,
  onNext,
  placeholder,
}: {
  options: QuestionOption[];
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const select = (opt: QuestionOption) => {
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query || (selected?.label ?? "")}
        placeholder={placeholder ?? "Search or select…"}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value) {
            e.preventDefault();
            onNext();
          }
          if (e.key === "Escape") setOpen(false);
        }}
        className={cn(
          "w-full bg-[var(--surface)] rounded-xl border-2 border-[var(--border)]",
          "focus:border-[var(--text-1)] outline-none appearance-none",
          "text-[var(--text-1)] text-2xl font-medium",
          "placeholder:text-[var(--text-3)] px-5 py-4 transition-colors"
        )}
        autoComplete="off"
      />

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full left-0 right-0 z-10 mt-2",
              "bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg",
              "max-h-64 overflow-y-auto"
            )}
          >
            {filtered.slice(0, 50).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(opt);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 text-base",
                  "hover:bg-[var(--surface-hover)] transition-colors",
                  value === opt.value
                    ? "font-semibold text-[var(--text-1)]"
                    : "text-[var(--text-2)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Block Message Banner ─────────────────────────────────────────────────────

function BlockMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "w-full p-5 rounded-xl border-2 border-[var(--danger)]",
        "bg-red-50 text-[var(--danger)]"
      )}
    >
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}

// ─── Main QuestionCard ────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
  onNext: () => void;
  onBack: () => void;
  questionNumber: number;
  totalQuestions: number;
  blockMessage?: string | null;
}

export function QuestionCard({
  question,
  value,
  onChange,
  onNext,
  onBack,
  questionNumber,
  totalQuestions,
  blockMessage,
}: QuestionCardProps) {
  const strValue = typeof value === "string" ? value : "";
  const arrValue = Array.isArray(value) ? (value as string[]) : [];

  const canAdvance = !blockMessage && (
    !question.required ||
    (question.type === "multi" ? arrValue.length > 0 : strValue !== "")
  );

  // Keep a ref so auto-advance timeouts (set up on click, firing 400ms later)
  // always read the *current* canAdvance even if the closure is stale.
  const canAdvanceRef = useRef(canAdvance);
  canAdvanceRef.current = canAdvance;

  const handleNext = useCallback(() => {
    if (canAdvanceRef.current) onNext();
  }, [onNext]);

  const qNum = String(questionNumber).padStart(2, "0");

  return (
    /*
     * Layout: top-padding reserves space for the fixed ProgressBar header
     * (~70px). On mobile with a keyboard open, `min-h-dvh` shrinks with the
     * viewport so content stays visible. We don't use `justify-center` for
     * questions with many options - instead we let content flow naturally
     * from the top with generous padding so it feels centered on short lists
     * but scrolls on long ones.
     */
    <div className="w-full max-w-2xl mx-auto px-5 md:px-8 pt-24 pb-16 flex flex-col min-h-dvh">
      {/* Back button - proper 44px touch target */}
      {questionNumber > 1 && (
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "fixed top-[52px] left-3 z-40",
            "flex items-center gap-1 text-[var(--text-3)] hover:text-[var(--text-1)]",
            "transition-colors text-sm font-medium",
            "min-h-[44px] min-w-[44px] px-2"
          )}
          aria-label="Go back"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </button>
      )}

      {/* Vertical centering spacer - pushes question down on short screens */}
      <div className="flex-1 flex flex-col justify-center">

        {/* Question text */}
        <h2 className="text-[clamp(24px,4.5vw,36px)] font-bold text-[var(--text-1)] leading-tight mb-3">
          {question.question}
          {question.required && (
            <span className="text-[var(--danger)] ml-1 text-xl leading-none align-super">
              *
            </span>
          )}
        </h2>

        {/* Subtitle */}
        {question.subtitle && (
          <p className="text-[var(--text-2)] text-[15px] mb-7 leading-relaxed max-w-lg">
            {question.subtitle}
          </p>
        )}
        {!question.subtitle && <div className="mb-7" />}

        {/* Note */}
        {question.note && (
          <p className="text-[var(--text-3)] text-sm mb-5 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3">
            {question.note}
          </p>
        )}

        {/* Block message */}
        {blockMessage && (
          <div className="mb-5">
            <BlockMessage message={blockMessage} />
          </div>
        )}

        {/* Answer input */}
        <div className="w-full">
          {(question.type === "text" ||
            question.type === "number" ||
            question.type === "date") && (
            <TextInput
              question={question}
              value={strValue}
              onChange={(v) => onChange(v)}
              onNext={handleNext}
            />
          )}

          {question.type === "yesno" && (
            <YesNoInput
              value={strValue}
              onChange={(v) => onChange(v)}
              onNext={handleNext}
            />
          )}

          {question.type === "single" && question.options && (
            <SingleSelect
              options={question.options}
              value={strValue}
              onChange={(v) => onChange(v)}
              onNext={handleNext}
            />
          )}

          {question.type === "multi" && question.options && (
            <MultiSelect
              options={question.options}
              value={arrValue}
              onChange={(v) => onChange(v)}
              onNext={handleNext}
            />
          )}

          {question.type === "dropdown" && question.options && (
            <DropdownSearch
              options={question.options}
              value={strValue}
              onChange={(v) => onChange(v)}
              onNext={handleNext}
              placeholder={question.placeholder}
            />
          )}
        </div>

        {/* OK button - hidden for single/yesno/multi (they auto-advance) */}
        {question.type !== "single" &&
          question.type !== "yesno" &&
          question.type !== "multi" && (
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance}
                className={cn(
                  "h-12 px-8 rounded-xl border-2 text-base font-semibold",
                  "transition-all duration-150 cursor-pointer",
                  canAdvance
                    ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95"
                    : "bg-[var(--border)] text-[var(--text-3)] border-[var(--border)] cursor-not-allowed"
                )}
              >
                OK
              </button>
              {/* Hidden on mobile - no physical Enter key on touch keyboards */}
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--text-3)]">
                press <kbd className="bg-[var(--surface)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono text-xs">Enter ↵</kbd>
              </span>
            </div>
          )}

      </div>{/* end justify-center wrapper */}
    </div>
  );
}
