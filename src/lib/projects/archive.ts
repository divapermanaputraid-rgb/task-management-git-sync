export type ProjectArchiveStatus = "ACTIVE" | "ARCHIVED";

type ValidateProjectArchiveTransitionParams = {
  currentStatus: ProjectArchiveStatus;
  nextStatus: ProjectArchiveStatus;
};

type SuccessfulProjectArchiveTransition = {
  ok: true;
  currentStatus: ProjectArchiveStatus;
  nextStatus: ProjectArchiveStatus;
  successEvent: "project.archived" | "project.unarchived";
};

type FailedProjectArchiveTransition = {
  ok: false;
  currentStatus: ProjectArchiveStatus;
  nextStatus: ProjectArchiveStatus;
  reason: "already_active" | "already_archived";
  message: string;
};

export type ProjectArchiveTransitionResult =
  | SuccessfulProjectArchiveTransition
  | FailedProjectArchiveTransition;

export function validateProjectArchiveTransition({
  currentStatus,
  nextStatus,
}: ValidateProjectArchiveTransitionParams): ProjectArchiveTransitionResult {
  if (currentStatus === nextStatus) {
    return {
      ok: false,
      currentStatus,
      nextStatus,
      reason:
        currentStatus === "ARCHIVED" ? "already_archived" : "already_active",
      message:
        currentStatus === "ARCHIVED"
          ? "Project ini sudah diarsipkan."
          : "Project ini sudah aktif.",
    };
  }

  return {
    ok: true,
    currentStatus,
    nextStatus,
    successEvent:
      nextStatus === "ARCHIVED" ? "project.archived" : "project.unarchived",
  };
}
