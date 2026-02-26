"use client";

import { useEffect } from "react";

type Props = {
  message: string | null;
  tone?: "success" | "error";
  onClose: () => void;
};

export default function Toast({ message, tone = "success", onClose }: Props) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 2400);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const palette =
    tone === "error"
      ? "border-rose-300 bg-rose-50 text-rose-700"
      : "border-emerald-300 bg-emerald-50 text-emerald-700";

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2">
      <div className={`rounded-lg border px-3 py-2 text-sm font-medium shadow-lg ${palette}`}>{message}</div>
    </div>
  );
}
