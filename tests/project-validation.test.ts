import test from "node:test";
import assert from "node:assert/strict";

import { createProjectSchema } from "../src/lib/validations/project";

test("createProjectSchema normalizes blank optional fields", () => {
  const result = createProjectSchema.safeParse({
    name: "Portal Operasional",
    description: "   ",
    startDate: "",
    endDate: "",
  });

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.description, null);
  assert.equal(result.data.startDate, null);
  assert.equal(result.data.endDate, null);
});

test("createProjectSchema accepts valid calendar dates", () => {
  const result = createProjectSchema.safeParse({
    name: "Portal Operasional",
    description: "Ringkasan singkat.",
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

test("createProjectSchema rejects impossible dates", () => {
  const result = createProjectSchema.safeParse({
    name: "Portal Operasional",
    description: "Ringkasan singkat.",
    startDate: "2024-02-31",
    endDate: "2024-03-05",
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
        path: "startDate",
        message: "Tanggal harus valid.",
      },
    ],
  );
});

test("createProjectSchema rejects timestamp-shaped date strings", () => {
  const result = createProjectSchema.safeParse({
    name: "Portal Operasional",
    description: "Ringkasan singkat.",
    startDate: "2026-04-20T10:30:00.000Z",
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
        path: "startDate",
        message: "Tanggal harus memakai format YYYY-MM-DD.",
      },
    ],
  );
});

test("createProjectSchema rejects reversed date ranges", () => {
  const result = createProjectSchema.safeParse({
    name: "Portal Operasional",
    description: "Ringkasan singkat.",
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
