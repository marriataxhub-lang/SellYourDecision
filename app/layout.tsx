import type { Metadata } from "next";
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
        <Header />
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
