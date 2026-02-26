"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LeftNav from "@/components/LeftNav";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const debounced = query.trim();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pathname !== "/" && !debounced) return;

      const next = pathname === "/" ? new URLSearchParams(params.toString()) : new URLSearchParams();
      if (debounced) {
        next.set("q", debounced);
      } else {
        next.delete("q");
      }
      const href = next.toString() ? `/?${next.toString()}` : "/";
      const current = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      if (href === current) return;
      router.replace(href);
    }, 280);

    return () => clearTimeout(timer);
  }, [debounced, pathname, params, router]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1420px] items-center gap-3 px-3 sm:px-4 lg:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
            aria-label="Open navigation"
          >
            <span className="block h-0.5 w-4 bg-current" />
            <span className="mt-1 block h-0.5 w-4 bg-current" />
            <span className="mt-1 block h-0.5 w-4 bg-current" />
          </button>

          <Link href="/" className="whitespace-nowrap text-sm font-bold text-slate-900 sm:text-base">
            Public Decision
          </Link>

          <div className="mx-auto hidden w-full max-w-xl md:block">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or details"
              className="field"
              aria-label="Search decisions"
            />
          </div>

          <Link href="/create" className="ml-auto rounded-full bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">
            Create
          </Link>
        </div>
        <div className="border-t border-slate-200 px-3 py-2 md:hidden">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or details"
            className="field"
            aria-label="Search decisions"
          />
        </div>
      </header>

      <LeftNav mobile open={open} onClose={() => setOpen(false)} />
    </>
  );
}
