import { AppSurface } from "@/components/ui/app-surface";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  TaskBoardStatus,
  VisibleTaskBoardColumn,
  VisibleTaskCard,
} from "@/lib/tasks/queries";

type ProjectTaskBoardProps = {
  columns: VisibleTaskBoardColumn[];
};

const statusLabels: Record<TaskBoardStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const statusTones: Record<
  TaskBoardStatus,
  "neutral" | "info" | "warning" | "review" | "success"
> = {
  BACKLOG: "neutral",
  TODO: "info",
  IN_PROGRESS: "warning",
  IN_REVIEW: "review",
  DONE: "success",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function formatTimeline(task: VisibleTaskCard) {
  if (task.startDate && task.endDate) {
    return `${formatDate(task.startDate)} - ${formatDate(task.endDate)}`;
  }

  return "Timeline belum ditentukan.";
}

function TaskCard({ task }: { task: VisibleTaskCard }) {
  return (
    <article className="space-y-3 rounded-xl border border-white/8 bg-white/4 p-4">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f0a832]">
          {task.code}
        </p>
        <h3 className="text-sm font-semibold leading-6 text-white">
          {task.title}
        </h3>
      </div>

      <div className="space-y-1 text-sm text-white/58">
        <p>{formatTimeline(task)}</p>
        <p>
          Owner:{" "}
          <span className="text-white/78">
            {task.primaryOwnerLabel ?? "Belum ditentukan"}
          </span>
        </p>
        <p>
          Assignee: <span className="text-white/78">{task.assigneeCount}</span>
        </p>
      </div>
    </article>
  );
}

export function ProjectTaskBoard({ columns }: ProjectTaskBoardProps) {
  const totalTasks = columns.reduce(
    (total, column) => total + column.tasks.length,
    0,
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Task Board
          </p>
          <h2 className="text-lg font-semibold text-white">
            Alur kerja task project
          </h2>
          <p className="text-sm leading-6 text-white/58">
            Board ini masih read-only sampai status transition diaktifkan.
          </p>
        </div>

        <StatusPill tone="info">{totalTasks} Task</StatusPill>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <AppSurface key={column.status} className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <StatusPill tone={statusTones[column.status]}>
                {statusLabels[column.status]}
              </StatusPill>
              <span className="text-xs font-semibold text-white/45">
                {column.tasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {column.tasks.length > 0 ? (
                column.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4">
                  <p className="text-sm leading-6 text-white/45">
                    Belum ada task di kolom ini.
                  </p>
                </div>
              )}
            </div>
          </AppSurface>
        ))}
      </div>
    </section>
  );
}
