import test from "node:test";
import assert from "node:assert/strict";

import { planGithubUserResolution } from "../src/lib/auth/queries";

function createAuthUser(
  overrides?: Partial<{
    id: string;
    name: string | null;
    email: string;
    passwordHash: string | null;
    role: "PM_ADMIN" | "DEVELOPER";
    githubAccountId: string | null;
  }>,
) {
  return {
    id: "user-1",
    name: "Dev User",
    email: "dev1@example.com",
    passwordHash: null,
    role: "DEVELOPER" as const,
    githubAccountId: null,
    ...overrides,
  };
}

test("uses existing linked GitHub user when githubAccountId already matches", () => {
  const linkedUser = createAuthUser({
    id: "user-1",
    role: "PM_ADMIN",
    githubAccountId: "gh_123",
  });

  const plan = planGithubUserResolution({
    githubAccountId: "gh_123",
    email: "someone@example.com",
    name: "Someone Else",
    existingLinkedUser: linkedUser,
    existingUserByEmail: null,
  });

  assert.deepEqual(plan, {
    kind: "use_linked_user",
    user: linkedUser,
  });
});

test("links existing email user when githubAccountId is null", () => {
  const existingUserByEmail = createAuthUser({
    id: "user-2",
    name: null,
    email: "dev1@example.com",
    githubAccountId: null,
  });

  const plan = planGithubUserResolution({
    githubAccountId: "gh_456",
    email: " Dev1@Example.com ",
    name: "  GitHub Dev  ",
    existingLinkedUser: null,
    existingUserByEmail,
  });

  assert.deepEqual(plan, {
    kind: "link_email_user",
    userId: "user-2",
    name: "GitHub Dev",
    githubAccountId: "gh_456",
  });
});

test("returns conflict when existing email user is linked to a different githubAccountId", () => {
  const existingUserByEmail = createAuthUser({
    id: "user-3",
    githubAccountId: "gh_other",
  });

  const plan = planGithubUserResolution({
    githubAccountId: "gh_789",
    email: "dev1@example.com",
    name: "GitHub Dev",
    existingLinkedUser: null,
    existingUserByEmail,
  });

  assert.deepEqual(plan, { kind: "identity_conflict" });
});

test("creates a new DEVELOPER user when no matching user exists", () => {
  const plan = planGithubUserResolution({
    githubAccountId: "gh_new",
    email: " NewUser@Example.com ",
    name: "  New User  ",
    existingLinkedUser: null,
    existingUserByEmail: null,
  });

  assert.deepEqual(plan, {
    kind: "create_user",
    email: "newuser@example.com",
    name: "New User",
    role: "DEVELOPER",
    githubAccountId: "gh_new",
  });
});
