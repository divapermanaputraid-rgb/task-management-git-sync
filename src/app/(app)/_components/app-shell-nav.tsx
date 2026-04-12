"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/my-taks", label: "My Tasks" },
  { href: "/setting", label: "Setting" },
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
  const isHorizontal = orientation == "horizontal";

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
                ? "border border-[#f0a832]/30 bg-[#f0a832]/12 text-[#f0a832]"
                : "border border-transparent text-white/58 hover:bg-white/5 hover:text-white",
            ].join("")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
