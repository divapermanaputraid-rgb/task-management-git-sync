import type { ReactNode } from "react";

type AppSurfaceProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

export function AppSurface({
  children,
  className,
  as: Component = "section",
}: AppSurfaceProps) {
  return (
    <Component
      className={[
        "rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}
