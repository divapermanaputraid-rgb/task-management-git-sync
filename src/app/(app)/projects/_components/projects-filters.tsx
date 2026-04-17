import { AppButton } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import type {
  ProjectBrowseScope,
  ProjectBrowseStatus,
} from "@/lib/projects/queries";

type ProjectsFiltersProps = {
  role: "PM_ADMIN" | "DEVELOPER";
  query: string;
  status: ProjectBrowseStatus;
  scope: ProjectBrowseScope;
  resultCount: number;
};

function getStatusValue(status: ProjectBrowseStatus) {
  if (status === "ARCHIVED") {
    return "archived";
  }

  if (status === "ALL") {
    return "all";
  }

  return "active";
}

function getScopeValue(scope: ProjectBrowseScope) {
  return scope === "OWNED" ? "owned" : "all";
}

export function ProjectsFilters({
  role,
  query,
  status,
  scope,
  resultCount,
}: ProjectsFiltersProps) {
  const isPmAdmin = role === "PM_ADMIN";
  const resultLabel =
    resultCount === 1 ? "1 project" : `${resultCount} project`;

  return (
    <AppSurface className="space-y-4">
      <form action="/projects" className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <label
              htmlFor="project-query"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
            >
              Cari Project
            </label>
            <input
              id="project-query"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Cari nama atau deskripsi project."
              className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f0a832]/40"
            />
          </div>

          <div className="space-y-2 xl:w-52">
            <label
              htmlFor="project-status"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
            >
              Status
            </label>
            <select
              id="project-status"
              name="status"
              defaultValue={getStatusValue(status)}
              className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none focus:border-[#f0a832]/40"
            >
              <option value="active">Project aktif</option>
              <option value="archived">Project arsip</option>
              <option value="all">Semua status</option>
            </select>
          </div>

          {isPmAdmin ? (
            <div className="space-y-2 xl:w-56">
              <label
                htmlFor="project-scope"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
              >
                Cakupan
              </label>
              <select
                id="project-scope"
                name="scope"
                defaultValue={getScopeValue(scope)}
                className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none focus:border-[#f0a832]/40"
              >
                <option value="all">Semua project</option>
                <option value="owned">Project yang saya buat</option>
              </select>
            </div>
          ) : null}

          <div className="flex gap-3 xl:pb-[1px]">
            <AppButton type="submit">Terapkan Filter</AppButton>
            <AppButton href="/projects" variant="ghost">
              Reset
            </AppButton>
          </div>
        </div>
      </form>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-white/58">
          {isPmAdmin
            ? "Gunakan filter ini untuk mempersempit daftar project atau fokus ke project yang Anda buat."
            : "Filter ini hanya berlaku untuk project yang menjadi membership Anda."}
        </p>
        <p className="text-sm text-white/35">Menampilkan {resultLabel}.</p>
      </div>
    </AppSurface>
  );
}
