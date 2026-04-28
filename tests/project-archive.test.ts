import test from "node:test";
import assert from "node:assert/strict";

import { validateProjectArchiveTransition } from "@/lib/projects/archive";
import { toggleProjectArchiveSchema } from "@/lib/validations/project";

test("toggleProjectArchiveSchema accepts valid archive payload", () => {
  const result = toggleProjectArchiveSchema.safeParse({
    projectId: "project_123",
    nextStatus: "ARCHIVED",
  });

  assert.equal(result.success, true);
});

test("toggleProjectArchiveSchema rejects blank projectId", () => {
  const result = toggleProjectArchiveSchema.safeParse({
    projectId: "  ",
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
    ],
  );
});

test("validateProjectArchiveTransition allows ACTIVE to ARCHIVED", () => {
  const result = validateProjectArchiveTransition({
    currentStatus: "ACTIVE",
    nextStatus: "ARCHIVED",
  });

  assert.deepEqual(result, {
    ok: true,
    currentStatus: "ACTIVE",
    nextStatus: "ARCHIVED",
    successEvent: "project.archived",
    successReason: "project_archived",
  });
});

test("validateProjectArchiveTransition allows ARCHIVED to ACTIVE", () => {
  const result = validateProjectArchiveTransition({
    currentStatus: "ARCHIVED",
    nextStatus: "ACTIVE",
  });

  assert.deepEqual(result, {
    ok: true,
    currentStatus: "ARCHIVED",
    nextStatus: "ACTIVE",
    successEvent: "project.unarchived",
    successReason: "project_unarchived",
  });
});

test("validateProjectArchiveTransition rejects ACTIVE to ACTIVE", () => {
  const result = validateProjectArchiveTransition({
    currentStatus: "ACTIVE",
    nextStatus: "ACTIVE",
  });

  assert.deepEqual(result, {
    ok: false,
    currentStatus: "ACTIVE",
    nextStatus: "ACTIVE",
    reason: "already_active",
    message: "Project ini sudah aktif.",
  });
});

test("validateProjectArchiveTransition rejects ARCHIVED to ARCHIVED", () => {
  const result = validateProjectArchiveTransition({
    currentStatus: "ARCHIVED",
    nextStatus: "ARCHIVED",
  });

  assert.deepEqual(result, {
    ok: false,
    currentStatus: "ARCHIVED",
    nextStatus: "ARCHIVED",
    reason: "already_archived",
    message: "Project ini sudah diarsipkan.",
  });
});
