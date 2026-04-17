"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/my-tasks", label: "My Tasks" },
  { href: "/settings", label: "Settings" },
] as const;

type AppShellNavProps = {
  orientation?: "vertical" | "horizontal";
};

function isActivePath(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  if (href === "/projects" && pathname.startsWith("/projects/")) {
    return true;
  }

  return false;
}

export function AppShellNav({ orientation = "vertical" }: AppShellNavProps) {
  const pathname = usePathname();
  const isHorizontal = orientation === "horizontal";

  return (
    <nav
      className={
        isHorizontal ? "flex gap-2 overflow-x-auto pb-1" : "flex flex-col gap-1"
      }
    >
      {navigationItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "rounded-xl px-3 py-2 text-sm font-medium transition",
              isHorizontal ? "whitespace-nowrap" : "",
              isActive
                ? "border border-accent/30 bg-accent/12 text-accent"
                : "border border-transparent text-muted hover:bg-surface-soft hover:text-foreground",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
