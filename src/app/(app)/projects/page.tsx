import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AppSurface } from "@/components/ui/app-surface";
import { StatusPill } from "@/components/ui/status-pill";
import { getVisibleProjects } from "@/lib/projects/queries";

import { ProjectCard } from "./_components/project-card";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const projects = await getVisibleProjects({
    userId: session.user.id,
    role: session.user.role,
  });

  const totalActiveTasks = projects.reduce(
    (total, project) => total + project.activeTaskCount,
    0,
  );
  const totalRepositories = projects.reduce(
    (total, project) => total + project.repositoryCount,
    0,
  );

  const viewLabel =
    session.user.role === "PM_ADMIN" ? "PM/Admin" : "Membership";
  const viewTone = session.user.role === "PM_ADMIN" ? "warning" : "info";

  return (
    <main className="space-y-6">
      <PageHeader
        title="Projects"
        description="Halaman ini menampilkan project aktif yang bisa Anda pantau dari satu tempat."
        action={<StatusPill tone={viewTone}>{viewLabel}</StatusPill>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <AppSurface className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Project Aktif
          </p>
          <p className="text-2xl font-semibold text-white">{projects.length}</p>
          <p className="text-sm text-white/58">
            Daftar aktif ditampilkan secara default.
          </p>
        </AppSurface>

        <AppSurface className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Tugas Aktif
          </p>
          <p className="text-2xl font-semibold text-white">
            {totalActiveTasks}
          </p>
          <p className="text-sm text-white/58">
            Angka ini dihitung dari project yang terlihat saat ini.
          </p>
        </AppSurface>

        <AppSurface className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Repository
          </p>
          <p className="text-2xl font-semibold text-white">
            {totalRepositories}
          </p>
          <p className="text-sm text-white/58">
            Koneksi repo memberi konteks aktivitas project.
          </p>
        </AppSurface>
      </section>

      {projects.length === 0 ? (
        <EmptyState
          eyebrow="Projects"
          title={
            session.user.role === "PM_ADMIN"
              ? "Belum ada project aktif."
              : "Anda belum tergabung ke project aktif."
          }
          description={
            session.user.role === "PM_ADMIN"
              ? "Halaman ini akan menampilkan ringkasan progres dan akses ke detail project saat data sudah tersedia."
              : "Halaman ini akan menampilkan project aktif yang memang menjadi membership Anda."
          }
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      )}
    </main>
  );
}
