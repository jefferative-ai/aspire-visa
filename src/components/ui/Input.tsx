"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id: idProp, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--text-2)] tracking-wide"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-transparent",
            "border-0 border-b-2 rounded-none",
            "px-0 py-3",
            "text-[var(--text-1)] text-xl font-medium placeholder:text-[var(--text-3)]",
            "transition-colors duration-150",
            "focus:outline-none",
            error
              ? "border-[var(--danger)] focus:border-[var(--danger)]"
              : "border-[var(--border)] focus:border-[var(--text-1)]",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${id}-error`}
            className="text-sm text-[var(--danger)] flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" />
              <path d="M7.25 4.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zM8 9.5a.75.75 0 100 1.5.75.75 0 000-1.5z" />
            </svg>
            {error}
          </p>
        )}

        {!error && hint && (
          <p
            id={`${id}-hint`}
            className="text-sm text-[var(--text-3)]"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
