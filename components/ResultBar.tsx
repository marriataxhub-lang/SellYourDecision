type Props = {
  label: string;
  value: number;
  percentage: number;
  tone: "a" | "b";
};

export default function ResultBar({ label, value, percentage, tone }: Props) {
  const color = tone === "a" ? "bg-orange-500" : "bg-sky-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="truncate pr-3">{label}</span>
        <span>{value} ({percentage}%)</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
