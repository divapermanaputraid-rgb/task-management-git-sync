import test from "node:test";
import assert from "node:assert/strict";

import { isAppRole, isValidAuthIdentity } from "@/lib/auth/roles";

test("isAppRole accepts only locked app roles", () => {
  assert.equal(isAppRole("PM_ADMIN"), true);
  assert.equal(isAppRole("DEVELOPER"), true);
  assert.equal(isAppRole("UNKNOWN_ROLE"), false);
  assert.equal(isAppRole(undefined), false);
});

test("isValidAuthIdentity requires a user id and locked app role", () => {
  assert.equal(isValidAuthIdentity({ id: "user-1", role: "DEVELOPER" }), true);
  assert.equal(
    isValidAuthIdentity({ id: "user-1", role: "UNKNOWN_ROLE" }),
    false,
  );
  assert.equal(isValidAuthIdentity({ role: "DEVELOPER" }), false);
  assert.equal(isValidAuthIdentity(null), false);
});
