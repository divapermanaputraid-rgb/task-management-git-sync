import test from "node:test";
import assert from "node:assert/strict";

import { createTaskSchema, setTaskStatusSchema } from "@/lib/validations/task";

test("createTaskSchema normalizes blank optional fields", () => {
  const result = createTaskSchema.safeParse({
    projectId: "project_123",
    title: "  Susun halaman detail tugas  ",
    description: "   ",
    startDate: "",
    endDate: "",
  });

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.title, "Susun halaman detail tugas");
  assert.equal(result.data.description, null);
  assert.equal(result.data.startDate, null);
  assert.equal(result.data.endDate, null);
});

test("createTaskSchema accepts valid timeline dates", () => {
  const result = createTaskSchema.safeParse({
    projectId: "project_123",
    title: "Susun halaman detail tugas",
    description: "Konteks pekerjaan.",
    startDate: "2026-04-20",
    endDate: "2026-04-30",
  });

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(
    result.data.startDate?.toISOString(),
    "2026-04-20T00:00:00.000Z",
  );
  assert.equal(result.data.endDate?.toISOString(), "2026-04-30T00:00:00.000Z");
});

test("createTaskSchema rejects one-sided timeline dates", () => {
  const result = createTaskSchema.safeParse({
    projectId: "project_123",
    title: "Susun halaman detail tugas",
    description: "Konteks pekerjaan.",
    startDate: "2026-04-20",
    endDate: "",
  });

  assert.equal(result.success, false);

  if (result.success) {
    return;
  }

  assert.deepEqual(
    result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
    [
      {
        path: "endDate",
        message: "Tanggal mulai dan akhir harus diisi bersama.",
      },
    ],
  );
});

test("createTaskSchema rejects reversed date ranges", () => {
  const result = createTaskSchema.safeParse({
    projectId: "project_123",
    title: "Susun halaman detail tugas",
    description: "Konteks pekerjaan.",
    startDate: "2026-05-01",
    endDate: "2026-04-30",
  });

  assert.equal(result.success, false);

  if (result.success) {
    return;
  }

  assert.deepEqual(
    result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
    [
      {
        path: "endDate",
        message: "Tanggal akhir harus sama atau setelah tanggal mulai.",
      },
    ],
  );
});

test("setTaskStatusSchema accepts valid status payload", () => {
  const result = setTaskStatusSchema.safeParse({
    projectId: "project_123",
    taskId: "task_123",
    nextStatus: "IN_PROGRESS",
  });

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.projectId, "project_123");
  assert.equal(result.data.taskId, "task_123");
  assert.equal(result.data.nextStatus, "IN_PROGRESS");
});

test("setTaskStatusSchema rejects invalid status payload", () => {
  const result = setTaskStatusSchema.safeParse({
    projectId: " ",
    taskId: "",
    nextStatus: "ARCHIVED",
  });

  assert.equal(result.success, false);

  if (result.success) {
    return;
  }

  assert.deepEqual(
    result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
    [
      {
        path: "projectId",
        message: "Project tidak valid.",
      },
      {
        path: "taskId",
        message: "Task tidak valid.",
      },
      {
        path: "nextStatus",
        message: "Status task tidak valid.",
      },
    ],
  );
});
