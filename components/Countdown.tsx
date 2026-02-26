"use client";

import { useEffect, useState } from "react";
import { getTimeRemainingLabel } from "@/lib/utils/time";

type Props = {
  expiresAt: string;
};

export default function Countdown({ expiresAt }: Props) {
  const [label, setLabel] = useState(getTimeRemainingLabel(expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setLabel(getTimeRemainingLabel(expiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">{label}</span>;
}