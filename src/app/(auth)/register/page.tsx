"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 md:p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--text-1)] mb-1">
          Create your account
        </h1>
        <p className="text-[var(--text-2)] text-sm mb-8">
          Save your screenings and access your reports anytime.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[var(--text-2)]"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={cn(
                "w-full bg-transparent border-0 border-b-2 border-[var(--border)]",
                "focus:outline-none focus:border-[var(--text-1)]",
                "text-[var(--text-1)] text-base pb-2.5 pt-1 transition-colors",
                "placeholder:text-[var(--text-3)]"
              )}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[var(--text-2)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className={cn(
                "w-full bg-transparent border-0 border-b-2 border-[var(--border)]",
                "focus:outline-none focus:border-[var(--text-1)]",
                "text-[var(--text-1)] text-base pb-2.5 pt-1 transition-colors",
                "placeholder:text-[var(--text-3)]"
              )}
            />
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirm"
              className="text-sm font-medium text-[var(--text-2)]"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              required
              className={cn(
                "w-full bg-transparent border-0 border-b-2 border-[var(--border)]",
                "focus:outline-none focus:border-[var(--text-1)]",
                "text-[var(--text-1)] text-base pb-2.5 pt-1 transition-colors",
                "placeholder:text-[var(--text-3)]",
                confirm && password !== confirm
                  ? "border-[var(--danger)]"
                  : ""
              )}
            />
            {confirm && password !== confirm && (
              <p className="text-xs text-[var(--danger)]">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "mt-2 w-full h-12 rounded-xl font-semibold text-base",
              "transition-all duration-150 cursor-pointer",
              loading
                ? "bg-[var(--border)] text-[var(--text-3)] cursor-not-allowed"
                : "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
            )}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-2)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--text-1)] underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
