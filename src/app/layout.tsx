import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aspire Visa Pro - Nordic Visa Eligibility Screening",
  description:
    "Find out if you qualify for a Nordic country visa. Precise, structured eligibility screening for Nigerian applicants.",
};

// Runs before React hydrates to apply the stored theme with no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t==null&&d))document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`;

// Injected as a raw <style> tag so Tailwind/Turbopack cannot strip it.
// :root block here guarantees hover vars survive even if Tailwind drops them from globals.css.
const darkThemeCSS = `
:root {
  --surface-hover: #F0F0EE;
  --accent-hover:  #1A1A1A;
}
[data-theme="dark"] {
  --bg:        #111110;
  --surface:   #1C1C1A;
  --border:    #2E2E2B;
  --text-1:    #F2F2F0;
  --text-2:    #A8A8A0;
  --text-3:    #636360;
  --accent:    #F2F2F0;
  --accent-fg: #111110;
  --success:        #34D474;
  --warning:        #FBBF24;
  --danger:         #F87171;
  --surface-hover:  #252522;
  --accent-hover:   #E2E2E0;
}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style dangerouslySetInnerHTML={{ __html: darkThemeCSS }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text-1)] antialiased">
        <ThemeProvider>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
