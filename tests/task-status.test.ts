import test from "node:test";
import assert from "node:assert/strict";

import { isTaskStatus, validateTaskStatusTransition } from "@/lib/tasks/status";

test("isTaskStatus accepts only locked task workflow statuses", () => {
  assert.equal(isTaskStatus("BACKLOG"), true);
  assert.equal(isTaskStatus("TODO"), true);
  assert.equal(isTaskStatus("IN_PROGRESS"), true);
  assert.equal(isTaskStatus("IN_REVIEW"), true);
  assert.equal(isTaskStatus("DONE"), true);
  assert.equal(isTaskStatus("ARCHIVED"), false);
  assert.equal(isTaskStatus(""), false);
  assert.equal(isTaskStatus(null), false);
});

test("validateTaskStatusTransition allows PM/Admin to move assigned task to any valid status", () => {
  const result = validateTaskStatusTransition({
    actorUserId: "pm_1",
    actorRole: "PM_ADMIN",
    currentStatus: "BACKLOG",
    nextStatus: "DONE",
    assigneeIds: ["dev_1"],
    primaryOwnerId: "dev_1",
    isTaskArchived: false,
    projectStatus: "ACTIVE",
  });

  assert.deepEqual(result, {
    ok: true,
    currentStatus: "BACKLOG",
    nextStatus: "DONE",
    successEvent: "task.status_changed",
    successReason: "task_status_changed",
  });
});

test("validateTaskStatusTransition allows Developer assigned workflow transitions", () => {
  assert.equal(
    validateTaskStatusTransition({
      actorUserId: "dev_1",
      actorRole: "DEVELOPER",
      currentStatus: "TODO",
      nextStatus: "IN_PROGRESS",
      assigneeIds: ["dev_1"],
      primaryOwnerId: "dev_1",
      isTaskArchived: false,
      projectStatus: "ACTIVE",
    }).ok,
    true,
  );

  assert.equal(
    validateTaskStatusTransition({
      actorUserId: "dev_1",
      actorRole: "DEVELOPER",
      currentStatus: "IN_PROGRESS",
      nextStatus: "IN_REVIEW",
      assigneeIds: ["dev_1"],
      primaryOwnerId: "dev_1",
      isTaskArchived: false,
      projectStatus: "ACTIVE",
    }).ok,
    true,
  );

  assert.equal(
    validateTaskStatusTransition({
      actorUserId: "dev_1",
      actorRole: "DEVELOPER",
      currentStatus: "IN_REVIEW",
      nextStatus: "IN_PROGRESS",
      assigneeIds: ["dev_1"],
      primaryOwnerId: "dev_1",
      isTaskArchived: false,
      projectStatus: "ACTIVE",
    }).ok,
    true,
  );
});

test("validateTaskStatusTransition rejects Developer moving task to DONE", () => {
  const result = validateTaskStatusTransition({
    actorUserId: "dev_1",
    actorRole: "DEVELOPER",
    currentStatus: "IN_REVIEW",
    nextStatus: "DONE",
    assigneeIds: ["dev_1"],
    primaryOwnerId: "dev_1",
    isTaskArchived: false,
    projectStatus: "ACTIVE",
  });

  assert.deepEqual(result, {
    ok: false,
    currentStatus: "IN_REVIEW",
    nextStatus: "DONE",
    reason: "done_requires_pm_admin",
    message: "Developer tidak bisa menyelesaikan task.",
  });
});

test("validateTaskStatusTransition rejects Developer who is not assigned", () => {
  const result = validateTaskStatusTransition({
    actorUserId: "dev_2",
    actorRole: "DEVELOPER",
    currentStatus: "TODO",
    nextStatus: "IN_PROGRESS",
    assigneeIds: ["dev_1"],
    primaryOwnerId: "dev_1",
    isTaskArchived: false,
    projectStatus: "ACTIVE",
  });

  assert.deepEqual(result, {
    ok: false,
    currentStatus: "TODO",
    nextStatus: "IN_PROGRESS",
    reason: "developer_not_assigned",
    message: "Developer hanya bisa mengubah task yang ditugaskan kepadanya.",
  });
});

test("validateTaskStatusTransition requires assignee and primary owner outside BACKLOG", () => {
  assert.deepEqual(
    validateTaskStatusTransition({
      actorUserId: "pm_1",
      actorRole: "PM_ADMIN",
      currentStatus: "BACKLOG",
      nextStatus: "TODO",
      assigneeIds: [],
      primaryOwnerId: null,
      isTaskArchived: false,
      projectStatus: "ACTIVE",
    }),
    {
      ok: false,
      currentStatus: "BACKLOG",
      nextStatus: "TODO",
      reason: "task_requires_assignee",
      message:
        "Task harus memiliki minimal satu assignee sebelum masuk workflow.",
    },
  );

  assert.deepEqual(
    validateTaskStatusTransition({
      actorUserId: "pm_1",
      actorRole: "PM_ADMIN",
      currentStatus: "BACKLOG",
      nextStatus: "TODO",
      assigneeIds: ["dev_1"],
      primaryOwnerId: null,
      isTaskArchived: false,
      projectStatus: "ACTIVE",
    }),
    {
      ok: false,
      currentStatus: "BACKLOG",
      nextStatus: "TODO",
      reason: "task_requires_primary_owner",
      message: "Task harus memiliki primary owner sebelum masuk workflow.",
    },
  );
});

test("validateTaskStatusTransition rejects archived project and archived task", () => {
  assert.deepEqual(
    validateTaskStatusTransition({
      actorUserId: "pm_1",
      actorRole: "PM_ADMIN",
      currentStatus: "TODO",
      nextStatus: "IN_PROGRESS",
      assigneeIds: ["dev_1"],
      primaryOwnerId: "dev_1",
      isTaskArchived: false,
      projectStatus: "ARCHIVED",
    }),
    {
      ok: false,
      currentStatus: "TODO",
      nextStatus: "IN_PROGRESS",
      reason: "project_archived",
      message: "Project arsip tidak bisa mengubah status task.",
    },
  );

  assert.deepEqual(
    validateTaskStatusTransition({
      actorUserId: "pm_1",
      actorRole: "PM_ADMIN",
      currentStatus: "TODO",
      nextStatus: "IN_PROGRESS",
      assigneeIds: ["dev_1"],
      primaryOwnerId: "dev_1",
      isTaskArchived: true,
      projectStatus: "ACTIVE",
    }),
    {
      ok: false,
      currentStatus: "TODO",
      nextStatus: "IN_PROGRESS",
      reason: "task_archived",
      message: "Task arsip tidak bisa diubah statusnya.",
    },
  );
});

test("validateTaskStatusTransition rejects same status transition", () => {
  const result = validateTaskStatusTransition({
    actorUserId: "pm_1",
    actorRole: "PM_ADMIN",
    currentStatus: "TODO",
    nextStatus: "TODO",
    assigneeIds: ["dev_1"],
    primaryOwnerId: "dev_1",
    isTaskArchived: false,
    projectStatus: "ACTIVE",
  });

  assert.deepEqual(result, {
    ok: false,
    currentStatus: "TODO",
    nextStatus: "TODO",
    reason: "same_status",
    message: "Task sudah berada di status tujuan.",
  });
});
