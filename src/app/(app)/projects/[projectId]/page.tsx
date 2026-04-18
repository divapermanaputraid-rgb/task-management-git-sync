import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader } from "@/components/shared/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { StatusPill } from "@/components/ui/status-pill";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { canArchiveProject } from "@/lib/Permission";
import { getVisibleProjectDetail } from "@/lib/projects/queries";

import { setProjectArchiveStateAction } from "./actions";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(getLoginRedirectUrl(`/projects/${projectId}`));
  }
  const project = await getVisibleProjectDetail({
    projectId,
    userId: session.user.id,
    role: session.user.role,
  });

  if (!project) {
    notFound();
  }

  const isArchived = project.status === "ARCHIVED";
  const canManageArchive = canArchiveProject(session.user.role);
  const statusLabel = isArchived ? "Arsip" : "Aktif";
  const statusTone = isArchived ? "neutral" : "success";
  const archiveActionLabel = isArchived
    ? "Aktifkan Kembali Project"
    : "Arsipkan Project";
  const nextStatus = isArchived ? "ACTIVE" : "ARCHIVED";

  const timelineLabel =
    project.startDate && project.endDate
      ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`
      : project.startDate
        ? `Mulai ${formatDate(project.startDate)}.`
        : project.endDate
          ? `Sampai ${formatDate(project.endDate)}.`
          : "Timeline belum ditentukan.";

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Project Detail"
        title={project.name}
        description={
          project.description ?? "Project ini belum memiliki deskripsi."
        }
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>

            {canManageArchive ? (
              <form action={setProjectArchiveStateAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="nextStatus" value={nextStatus} />
                <AppButton
                  type="submit"
                  variant={isArchived ? "primary" : "secondary"}
                >
                  {archiveActionLabel}
                </AppButton>
              </form>
            ) : null}
          </div>
        }
      />

      {isArchived ? (
        <AppSurface className="border-[#f0a832]/20 bg-[#221b0f]">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f0a832]">
              Read-only
            </p>
            <h2 className="text-lg font-semibold text-white">
              Project ini sedang diarsipkan.
            </h2>
            <p className="text-sm leading-6 text-white/68">
              Project arsip hanya bisa dibuka dalam mode baca sampai diaktifkan
              kembali.
            </p>
          </div>
        </AppSurface>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AppSurface className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Timeline
          </p>
          <p className="text-sm font-semibold text-white/88">{timelineLabel}</p>
        </AppSurface>

        <AppSurface className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Member
          </p>
          <p className="text-2xl font-semibold text-white">
            {project.memberCount}
          </p>
          <p className="text-sm text-white/58">
            Dibuat oleh {project.createdByLabel}.
          </p>
        </AppSurface>

        <AppSurface className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Repository
          </p>
          <p className="text-2xl font-semibold text-white">
            {project.repositoryCount}
          </p>
          <p className="text-sm text-white/58">
            Koneksi repo tetap terlihat di level project.
          </p>
        </AppSurface>

        <AppSurface className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Progress
          </p>
          <p className="text-2xl font-semibold text-white">
            {project.progressPercentage}%
          </p>
          <p className="text-sm text-white/58">
            {project.activeTaskCount > 0
              ? `${project.completedTaskCount} dari ${project.activeTaskCount} tugas aktif sudah selesai.`
              : "Project ini belum memiliki tugas aktif."}
          </p>
        </AppSurface>
      </section>

      <AppSurface className="space-y-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Board Context
          </p>
          <h2 className="text-lg font-semibold text-white">
            Surface detail project akan dikembangkan di task berikutnya.
          </h2>
          <p className="text-sm leading-6 text-white/58">
            {isArchived
              ? "Selama project masih arsip, surface ini tetap dibuka dalam mode baca."
              : "Untuk sekarang halaman ini menyiapkan status dan konteks project sebelum detail penuh dibangun."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/35">
            Diperbarui {formatDate(project.updatedAt)}.
          </p>
          <AppButton href="/projects" variant="ghost">
            Kembali ke Projects
          </AppButton>
        </div>
      </AppSurface>
    </main>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
