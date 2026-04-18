import { redirect } from "next/navigation";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { auth } from "@/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getVisibleProjects,
  type ProjectBrowseScope,
  type ProjectBrowseStatus,
} from "@/lib/projects/queries";

import { ProjectCard } from "./_components/project-card";
import { ProjectsFilters } from "./_components/projects-filters";

type ProjectsPageSearchParams = {
  q?: string | string[];
  status?: string | string[];
  scope?: string | string[];
};

type ProjectsPageProps = {
  searchParams: Promise<ProjectsPageSearchParams>;
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getStatusFilter(
  value: string | string[] | undefined,
): ProjectBrowseStatus {
  const normalizedValue = getSingleSearchParam(value)?.toLowerCase();

  if (normalizedValue === "archived") {
    return "ARCHIVED";
  }

  if (normalizedValue === "all") {
    return "ALL";
  }

  return "ACTIVE";
}

function getScopeFilter(
  value: string | string[] | undefined,
  role: "PM_ADMIN" | "DEVELOPER",
): ProjectBrowseScope {
  if (role !== "PM_ADMIN") {
    return "ALL";
  }

  return getSingleSearchParam(value)?.toLowerCase() === "owned"
    ? "OWNED"
    : "ALL";
}

function getQueryFilter(value: string | string[] | undefined) {
  return getSingleSearchParam(value)?.trim() ?? "";
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(getLoginRedirectUrl("/projects"));
  }

  const currentSearchParams = await searchParams;
  const statusFilter = getStatusFilter(currentSearchParams.status);
  const scopeFilter = getScopeFilter(
    currentSearchParams.scope,
    session.user.role,
  );
  const queryFilter = getQueryFilter(currentSearchParams.q);

  const projects = await getVisibleProjects({
    userId: session.user.id,
    role: session.user.role,
    filters: {
      status: statusFilter,
      scope: scopeFilter,
      query: queryFilter,
    },
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

  const projectCountLabel =
    statusFilter === "ARCHIVED"
      ? "Project Arsip"
      : statusFilter === "ALL"
        ? "Project Terlihat"
        : "Project Aktif";

  const projectCountDescription =
    statusFilter === "ARCHIVED"
      ? "Daftar arsip mengikuti filter yang sedang aktif."
      : statusFilter === "ALL"
        ? "Daftar ini memuat project aktif dan arsip."
        : "Daftar aktif ditampilkan secara default.";

  const hasActiveFilters =
    queryFilter.length > 0 ||
    statusFilter !== "ACTIVE" ||
    (session.user.role === "PM_ADMIN" && scopeFilter === "OWNED");

  return (
    <main className="space-y-6">
      <PageHeader
        title="Projects"
        description="Halaman ini menampilkan project yang bisa Anda telusuri dari satu surface kerja."
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <StatusPill tone={viewTone}>{viewLabel}</StatusPill>
            {session.user.role === "PM_ADMIN" ? (
              <AppButton href="/projects/new">Buat Project</AppButton>
            ) : null}
          </div>
        }
      />

      <ProjectsFilters
        role={session.user.role}
        query={queryFilter}
        status={statusFilter}
        scope={scopeFilter}
        resultCount={projects.length}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <AppSurface className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            {projectCountLabel}
          </p>
          <p className="text-2xl font-semibold text-white">{projects.length}</p>
          <p className="text-sm text-white/58">{projectCountDescription}</p>
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
            hasActiveFilters
              ? "Tidak ada project yang cocok dengan filter ini."
              : session.user.role === "PM_ADMIN"
                ? "Belum ada project aktif."
                : "Anda belum tergabung ke project aktif."
          }
          description={
            hasActiveFilters
              ? "Ubah filter atau reset tampilan untuk melihat daftar project lain."
              : session.user.role === "PM_ADMIN"
                ? "Halaman ini akan menampilkan ringkasan progres dan akses ke detail project saat data sudah tersedia."
                : "Halaman ini akan menampilkan project aktif yang memang menjadi membership Anda."
          }
          action={
            hasActiveFilters ? (
              <AppButton href="/projects" variant="secondary">
                Reset Filter
              </AppButton>
            ) : undefined
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
