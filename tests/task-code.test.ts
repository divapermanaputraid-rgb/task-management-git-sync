import test from "node:test";
import assert from "node:assert/strict";

import { formatTaskCode } from "@/lib/tasks/codes";

test("formatTaskCode formats positive integer sequences", () => {
  assert.equal(formatTaskCode(1), "TASK-1");
  assert.equal(formatTaskCode(12), "TASK-12");
});

test("formatTaskCode rejects invalid sequences", () => {
  assert.throws(() => formatTaskCode(0), {
    message: "Task sequence must be a positive integer.",
  });
  assert.throws(() => formatTaskCode(1.5), {
    message: "Task sequence must be a positive integer.",
  });
});
