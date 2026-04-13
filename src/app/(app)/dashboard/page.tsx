import { auth } from "@/auth";
import { PageHeader } from "@/components/shared/page-header";
import { AppSurface } from "@/components/ui/app-surface";
import { StatusPill } from "@/components/ui/status-pill";

export default async function DashboardPage() {
  const session = await auth();

  const roleLabel =
    session?.user.role === "PM_ADMIN" ? "PM/Admin" : "Developer";
  const roleTone = session?.user.role === "PM_ADMIN" ? "warning" : "info";

  return (
    <main className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Halaman ini menjadi entry ringkas untuk sesi pengguna yang sedang aktif."
        action={<StatusPill tone={roleTone}>{roleLabel}</StatusPill>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AppSurface className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">
            User ID
          </p>
          <p className="text-sm text-white/88">{session?.user.id}</p>
        </AppSurface>

        <AppSurface className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">
            Email
          </p>
          <p className="text-sm text-white/88">{session?.user.email}</p>
        </AppSurface>

        <AppSurface className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">
            Role
          </p>
          <p className="text-sm text-white/88">{roleLabel}</p>
        </AppSurface>
      </div>
    </main>
  );
}
