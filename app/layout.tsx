import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Public Decision Platform",
  description: "Post decisions, vote anonymously, and view final outcomes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div className="sticky top-0 z-50 h-14 border-b border-slate-200 bg-white/95" />}>
          <Header />
        </Suspense>
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
