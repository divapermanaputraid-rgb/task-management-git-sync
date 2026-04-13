import type { ReactNode } from "react";

type StatusPillTone =
  | "neutral"
  | "info"
  | "warning"
  | "review"
  | "success"
  | "danger";

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusPillTone;
  className?: string;
};

const toneClasses: Record<StatusPillTone, string> = {
  neutral: "border-white/10 bg-white/6 text-white/60",
  info: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  warning: "border-[#f0a832]/20 bg-[#f0a832]/10 text-[#f0a832]",
  review: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  danger: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

export function StatusPill({
  children,
  tone = "neutral",
  className,
}: StatusPillProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        toneClasses[tone],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
