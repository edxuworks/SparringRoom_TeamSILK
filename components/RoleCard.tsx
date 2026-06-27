"use client";

/**
 * components/RoleCard.tsx — role-selection card (style spec §5/§6).
 * primary = dark graphite (Junior); secondary = white with muted-gold border (Admin).
 */

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function RoleCard({
  title,
  description,
  variant,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  variant: "primary" | "secondary";
  icon: ReactNode;
  onClick: () => void;
}) {
  const primary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full items-center gap-6 rounded-2xl px-7 py-6 text-left transition duration-200",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/35",
        "min-h-[72px]",
        primary
          ? "bg-ink text-white shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:bg-ink-hover"
          : "border border-gold/45 bg-white/88 text-[--color-text-primary] shadow-[var(--shadow-soft)] backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white",
      ].join(" ")}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/45 text-gold">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-semibold tracking-[-0.01em]">
          {title}
        </span>
        <span
          className={
            "mt-1 block text-sm " +
            (primary ? "text-slate-300" : "text-[--color-text-secondary]")
          }
        >
          {description}
        </span>
      </span>
      <ArrowRight className="h-6 w-6 shrink-0 text-gold transition group-hover:translate-x-1" />
    </button>
  );
}
