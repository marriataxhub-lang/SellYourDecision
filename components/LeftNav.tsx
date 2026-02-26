"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Category } from "@/lib/types";

const categories: Category[] = ["Career", "Relationships", "Lifestyle", "Money (safe)", "Other"];

type Props = {
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
};

export default function LeftNav({ mobile = false, open = false, onClose }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();

  const linkClass = (href: string) => {
    const active = href === pathname || (href.startsWith("/?") && pathname === "/" && `/?${params.toString()}`.startsWith(href));
    return `block rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-orange-100 text-orange-700" : "text-slate-700 hover:bg-slate-100"}`;
  };

  const content = (
    <div className="panel space-y-4 p-3">
      <nav className="space-y-1">
        <Link href="/" className={linkClass("/")}>Home</Link>
        <Link href="/?status=active" className={linkClass("/?status=active")}>Active</Link>
        <Link href="/?status=ended" className={linkClass("/?status=ended")}>Ended</Link>
        <Link href="/create" className={linkClass("/create")}>Create decision</Link>
        <Link href="/rules" className={linkClass("/rules")}>Rules</Link>
      </nav>
      <div className="border-t border-slate-200 pt-3">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Categories</p>
        <div className="mt-2 space-y-1">
          {categories.map((category) => (
            <Link key={category} href={`/?category=${encodeURIComponent(category)}`} className={linkClass(`/?category=${encodeURIComponent(category)}`)}>
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  if (!mobile) {
    return <div className="sticky top-[72px]">{content}</div>;
  }

  return (
    <div className={`fixed inset-0 z-[60] transition ${open ? "visible" : "invisible"}`}>
      <button className={`absolute inset-0 bg-black/40 transition ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} aria-label="Close menu" />
      <div className={`absolute left-0 top-0 h-full w-72 p-3 transition ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {content}
      </div>
    </div>
  );
}
