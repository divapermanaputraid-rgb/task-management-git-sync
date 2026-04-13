import { auth } from "@/auth";
import { AppButton } from "@/components/ui/app-button";

import { AppShellNav } from "./_components/app-shell-nav";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  const displayName = session?.user.name ?? session?.user.email ?? "User";
  const roleLabel =
    session?.user.role === "PM_ADMIN" ? "PM/Admin" : "Developer";
  const quickActionHref =
    session?.user.role === "PM_ADMIN" ? "/projects" : "/my-tasks";
  const quickActionLabel =
    session?.user.role === "PM_ADMIN" ? "Buka Projects" : "Buka My Tasks";

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#131316] lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Internal Task Management
            </p>
            <h1 className="mt-3 text-xl font-semibold text-white">Workspace</h1>
            <p className="mt-2 text-sm leading-6 text-white/58">
              Satu shell untuk dashboard, project, tugas, dan pengaturan.
            </p>
          </div>

          <div className="flex-1 px-4 py-6">
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Navigation
            </p>
            <AppShellNav />
          </div>

          <div className="border-t border-white/10 px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Default Surface
            </p>
            <p className="mt-2 text-sm text-white/68">
              {session?.user.role === "PM_ADMIN"
                ? "PM/Admin masuk ke Dashboard."
                : "Developer masuk ke My Tasks."}
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-white/10 bg-[#131316]">
            <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  App Shell
                </p>
                <p className="mt-1 text-sm text-white/62">
                  Gunakan shell ini untuk semua halaman internal yang sudah
                  diautentikasi.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 lg:min-w-[280px]">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/28">
                    Search
                  </span>
                  <span className="truncate">
                    Cari project, task, atau anggota.
                  </span>
                </div>

                <AppButton href={quickActionHref}>{quickActionLabel}</AppButton>

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm font-semibold text-white">
                    {displayName}
                  </p>
                  <p className="text-xs text-white/52">{roleLabel}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 px-5 py-3 lg:hidden">
              <AppShellNav orientation="horizontal" />
            </div>
          </header>

          <main className="flex-1 bg-[#0f1013]">
            <div className="mx-auto w-full max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
              <div className="rounded-[28px] border border-white/10 bg-[#131316] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] lg:p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
