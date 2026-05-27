"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessCodePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Invalid access code. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/");
    } catch (err) {
      setError("Unable to verify the code. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)] px-6 py-24">
      <div className="max-w-xl w-full rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-10 shadow-[0_35px_120px_-45px_rgba(0,0,0,0.35)]">
        <h1 className="text-3xl font-bold text-[var(--text-1)] mb-4">Enter access code</h1>
        <p className="text-sm text-[var(--text-2)] mb-8">
          This site is currently protected. Enter the access code to proceed.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-[var(--text-2)]">
            Access code
            <input
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-4 text-[var(--text-1)] outline-none transition focus:border-[var(--accent)]"
              placeholder="Enter your code"
            />
          </label>

          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-6 text-base font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Checking code…" : "Unlock site"}
          </button>
        </form>
      </div>
    </div>
  );
}
