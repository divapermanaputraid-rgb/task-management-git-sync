import test from "node:test";
import assert from "node:assert/strict";

import { logger } from "@/lib/logger";

test("logger.warn keeps event id and structured context", () => {
  const calls: string[] = [];
  const originalWarn = console.warn;

  console.warn = ((value?: unknown) => {
    calls.push(String(value));
  }) as typeof console.warn;

  try {
    logger.warn("project.create_invalid_payload", {
      area: "projects",
      action: "create_project",
      result: "rejected",
      reason: "invalid_payload",
      issueFields: ["name", "endDate"],
    });
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(calls.length, 1);

  const entry = JSON.parse(calls[0]) as Record<string, unknown>;

  assert.equal(entry.level, "warn");
  assert.equal(entry.event, "project.create_invalid_payload");
  assert.equal(entry.area, "projects");
  assert.equal(entry.action, "create_project");
  assert.equal(entry.result, "rejected");
  assert.deepEqual(entry.issueFields, ["name", "endDate"]);
});

test("logger.error keeps event id and serialized safe error fields", () => {
  const calls: string[] = [];
  const originalError = console.error;

  console.error = ((value?: unknown) => {
    calls.push(String(value));
  }) as typeof console.error;

  try {
    const error = Object.assign(new Error("Database unavailable"), {
      code: "P2024",
    });

    logger.error(
      "project.create_failed",
      {
        area: "projects",
        action: "create_project",
        result: "failed",
        reason: "database_write_failed",
      },
      error,
    );
  } finally {
    console.error = originalError;
  }

  assert.equal(calls.length, 1);

  const entry = JSON.parse(calls[0]) as Record<string, unknown>;

  assert.equal(entry.level, "error");
  assert.equal(entry.event, "project.create_failed");
  assert.equal(entry.reason, "database_write_failed");
  assert.equal(entry.errorName, "Error");
  assert.equal(entry.errorMessage, "Database unavailable");
  assert.equal(entry.errorCode, "P2024");
});
