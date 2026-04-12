import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const roleLabel =
    session?.user.role === "PM_ADMIN" ? "PM/Admin" : "Developer";

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Halaman ini menjadi entry ringkas untuk sesi pengguna yang sedang
          aktif.
        </p>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              User ID
            </p>
            <p className="text-sm text-slate-900">{session?.user.id}</p>
          </div>

          <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Email
            </p>
            <p className="text-sm text-slate-900">{session?.user.email}</p>
          </div>

          <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Role
            </p>
            <p className="text-sm text-slate-900">{roleLabel}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
