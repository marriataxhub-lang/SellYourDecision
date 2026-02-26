import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Public Decision Platform",
  description: "Post decisions, vote anonymously, and view final outcomes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="text-base font-bold tracking-wide text-white sm:text-lg">
              Public <span className="gradient-text">Decision</span> Platform
            </Link>
            <nav className="flex items-center gap-2 text-sm font-medium sm:gap-4">
              <Link href="/" className="rounded-lg px-3 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white">Home</Link>
              <Link href="/create" className="rounded-lg px-3 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white">Create</Link>
              <Link href="/rules" className="rounded-lg px-3 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white">Rules</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}