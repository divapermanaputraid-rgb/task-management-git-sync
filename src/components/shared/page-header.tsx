import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
        ) : null}

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        </div>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
