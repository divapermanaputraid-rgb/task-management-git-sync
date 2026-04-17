import type { ReactNode } from "react";

import { AppSurface } from "@/components/ui/app-surface";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <AppSurface>
      <div className="max-w-2xl space-y-3">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
        ) : null}

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm leading-6 text-muted">{description}</p>
        </div>

        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </AppSurface>
  );
}
