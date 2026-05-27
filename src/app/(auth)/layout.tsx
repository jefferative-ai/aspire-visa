import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg)]">
      {/* Brand bar */}
      <header className="px-6 md:px-12 py-5">
        <Link
          href="/"
          className="font-bold text-[var(--text-1)] tracking-tight text-lg hover:opacity-80 transition-opacity"
        >
          Aspire Visa Pro
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-[var(--text-3)]">
          Advisory only. Not legal advice.
        </p>
      </footer>
    </div>
  );
}
