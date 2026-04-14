import { AppButton } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { StatusPill } from "@/components/ui/status-pill";
import type { VisibleProjectSummary } from "@/lib/projects/queries";

type ProjectCardProps = {
  project: VisibleProjectSummary;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(date: Date | null) {
  if (!date) {
    return "Belum ditentukan.";
  }

  return dateFormatter.format(date);
}

function formatTimeline(startDate: Date | null, endDate: Date | null) {
  if (!startDate && !endDate) {
    return "Timeline belum ditentukan.";
  }

  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  if (startDate) {
    return `Mulai ${formatDate(startDate)}.`;
  }

  return `Sampai ${formatDate(endDate)}.`;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusLabel = project.status === "ACTIVE" ? "Aktif" : "Arsip";
  const statusTone = project.status === "ACTIVE" ? "success" : "neutral";

  return (
    <AppSurface className="flex h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Project
          </p>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">{project.name}</h2>
            <p className="text-sm leading-6 text-white/58">
              {project.description ?? "Project ini belum memiliki deskripsi."}
            </p>
          </div>
        </div>

        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">
          <span>Progress</span>
          <span>{project.progressPercentage}%</span>
        </div>

        <div className="h-2 rounded-full bg-white/8">
          <div
            className="h-2 rounded-full bg-[#f0a832] transition-[width] duration-200"
            style={{ width: `${project.progressPercentage}%` }}
          />
        </div>

        <p className="text-sm text-white/58">
          {project.activeTaskCount > 0
            ? `${project.completedTaskCount} dari ${project.activeTaskCount} tugas aktif sudah selesai.`
            : "Project ini belum memiliki tugas aktif."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/8 bg-white/4 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Member
          </p>
          <p className="mt-2 text-sm font-semibold text-white/88">
            {project.memberCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/4 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Tugas Aktif
          </p>
          <p className="mt-2 text-sm font-semibold text-white/88">
            {project.activeTaskCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/4 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Repository
          </p>
          <p className="mt-2 text-sm font-semibold text-white/88">
            {project.repositoryCount}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-3 border-t border-white/8 pt-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Informasi
          </p>
          <p className="text-sm text-white/68">
            Dibuat oleh {project.createdByLabel}.
          </p>
          <p className="text-sm text-white/58">
            {formatTimeline(project.startDate, project.endDate)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            Diperbarui {formatDate(project.updatedAt)}.
          </p>

          <AppButton
            href={`/projects/${project.id}`}
            variant="secondary"
            className="px-3 py-2"
          >
            Buka Detail
          </AppButton>
        </div>
      </div>
    </AppSurface>
  );
}
