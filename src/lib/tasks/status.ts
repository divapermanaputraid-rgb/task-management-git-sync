import type { AppRole } from "@/lib/auth/roles";

export const TASK_STATUSES = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type ProjectStatusForTaskTransition = "ACTIVE" | "ARCHIVED";

type ValidateTaskStatusTransitionParams = {
  actorUserId: string;
  actorRole: AppRole;
  currentStatus: TaskStatus;
  nextStatus: TaskStatus;
  assigneeIds: readonly string[];
  primaryOwnerId: string | null;
  isTaskArchived: boolean;
  projectStatus: ProjectStatusForTaskTransition;
};

type SuccessfulTaskStatusTransition = {
  ok: true;
  currentStatus: TaskStatus;
  nextStatus: TaskStatus;
  successEvent: "task.status_changed";
  successReason: "task_status_changed";
};

type FailedTaskStatusTransition = {
  ok: false;
  currentStatus: TaskStatus;
  nextStatus: TaskStatus;
  reason:
    | "project_archived"
    | "task_archived"
    | "same_status"
    | "task_requires_assignee"
    | "task_requires_primary_owner"
    | "developer_not_assigned"
    | "done_requires_pm_admin"
    | "developer_transition_not_allowed";
  message: string;
};

export type TaskStatusTransitionResult =
  | SuccessfulTaskStatusTransition
  | FailedTaskStatusTransition;

const developerAllowedTransitions: Partial<
  Record<TaskStatus, readonly TaskStatus[]>
> = {
  TODO: ["IN_PROGRESS"],
  IN_PROGRESS: ["IN_REVIEW"],
  IN_REVIEW: ["IN_PROGRESS"],
};

export function isTaskStatus(status: unknown): status is TaskStatus {
  return (
    typeof status === "string" && TASK_STATUSES.includes(status as TaskStatus)
  );
}

export function validateTaskStatusTransition({
  actorUserId,
  actorRole,
  currentStatus,
  nextStatus,
  assigneeIds,
  primaryOwnerId,
  isTaskArchived,
  projectStatus,
}: ValidateTaskStatusTransitionParams): TaskStatusTransitionResult {
  if (projectStatus === "ARCHIVED") {
    return {
      ok: false,
      currentStatus,
      nextStatus,
      reason: "project_archived",
      message: "Project arsip tidak bisa mengubah status task.",
    };
  }

  if (isTaskArchived) {
    return {
      ok: false,
      currentStatus,
      nextStatus,
      reason: "task_archived",
      message: "Task arsip tidak bisa diubah statusnya.",
    };
  }

  if (currentStatus === nextStatus) {
    return {
      ok: false,
      currentStatus,
      nextStatus,
      reason: "same_status",
      message: "Task sudah berada di status tujuan.",
    };
  }

  if (nextStatus !== "BACKLOG" && assigneeIds.length === 0) {
    return {
      ok: false,
      currentStatus,
      nextStatus,
      reason: "task_requires_assignee",
      message:
        "Task harus memiliki minimal satu assignee sebelum masuk workflow.",
    };
  }

  if (nextStatus !== "BACKLOG" && !primaryOwnerId) {
    return {
      ok: false,
      currentStatus,
      nextStatus,
      reason: "task_requires_primary_owner",
      message: "Task harus memiliki primary owner sebelum masuk workflow.",
    };
  }

  if (actorRole === "PM_ADMIN") {
    return {
      ok: true,
      currentStatus,
      nextStatus,
      successEvent: "task.status_changed",
      successReason: "task_status_changed",
    };
  }

  if (!assigneeIds.includes(actorUserId)) {
    return {
      ok: false,
      currentStatus,
      nextStatus,
      reason: "developer_not_assigned",
      message: "Developer hanya bisa mengubah task yang ditugaskan kepadanya.",
    };
  }

  if (nextStatus === "DONE") {
    return {
      ok: false,
      currentStatus,
      nextStatus,
      reason: "done_requires_pm_admin",
      message: "Developer tidak bisa menyelesaikan task.",
    };
  }

  const allowedNextStatuses = developerAllowedTransitions[currentStatus] ?? [];

  if (!allowedNextStatuses.includes(nextStatus)) {
    return {
      ok: false,
      currentStatus,
      nextStatus,
      reason: "developer_transition_not_allowed",
      message: "Transisi status ini tidak tersedia untuk Developer.",
    };
  }

  return {
    ok: true,
    currentStatus,
    nextStatus,
    successEvent: "task.status_changed",
    successReason: "task_status_changed",
  };
}
