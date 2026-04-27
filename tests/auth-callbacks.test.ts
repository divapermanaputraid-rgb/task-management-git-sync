import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { authOptions } =
  require("../src/auth.ts") as typeof import("../src/auth");

const signInCallback = authOptions.callbacks?.signIn;
const jwtCallback = authOptions.callbacks?.jwt;
const sessionCallback = authOptions.callbacks?.session;

if (!signInCallback || !jwtCallback || !sessionCallback) {
  throw new Error("Auth callbacks harus tersedia.");
}

async function captureWarn<T>(run: () => Promise<T>) {
  const calls: string[] = [];
  const originalWarn = console.warn;

  console.warn = ((value?: unknown) => {
    calls.push(String(value));
  }) as typeof console.warn;

  try {
    const result = await run();
    return { result, calls };
  } finally {
    console.warn = originalWarn;
  }
}

test("signIn callback allows non-GitHub providers", async () => {
  const result = await signInCallback({
    user: { id: "user-1", email: "dev1@newus.com", role: "DEVELOPER" },
    account: {
      provider: "credentials",
      type: "credentials",
      providerAccountId: "dev1@newus.com",
    },
  } as Parameters<typeof signInCallback>[0]);

  assert.equal(result, true);
});

test("signIn callback rejects incomplete GitHub identity", async () => {
  const { result, calls } = await captureWarn(() =>
    signInCallback({
      user: { name: "GitHub Dev" },
      account: { provider: "github", type: "oauth", providerAccountId: "" },
    } as Parameters<typeof signInCallback>[0]),
  );

  assert.equal(result, "/login?error=github_identity_incomplete");
  assert.equal(JSON.parse(calls[0]).reason, "identity_incomplete");
});

test("jwt callback keeps internal id and role on first sign-in", async () => {
  const token = await jwtCallback({
    token: {},
    user: { id: "user-1", role: "PM_ADMIN" },
  } as Parameters<typeof jwtCallback>[0]);

  assert.equal(token.id, "user-1");
  assert.equal(token.role, "PM_ADMIN");
});

test("session callback forwards token identity to the session", async () => {
  const session = await sessionCallback({
    session: {
      user: { email: "dev1@newus.com", name: "Dev 1", image: null },
      expires: "2099-01-01T00:00:00.000Z",
    },
    token: { id: "user-1", role: "DEVELOPER" },
  } as Parameters<typeof sessionCallback>[0]);

  assert.equal(session.user.id, "user-1");
  assert.equal(session.user.role, "DEVELOPER");
});

test("session callback recovers missing token identity safely", async () => {
  const sessionArgs = {
    session: {
      user: { email: "dev1@newus.com", name: "Dev 1", image: null },
      expires: "2099-01-01T00:00:00.000Z",
    },
    token: { role: "UNKNOWN_ROLE" },
  } as unknown as Parameters<typeof sessionCallback>[0];

  const { result, calls } = await captureWarn(() =>
    sessionCallback(sessionArgs),
  );

  assert.equal(result.user.id, "");
  assert.equal(result.user.role, "DEVELOPER");
  assert.deepEqual(calls.map((entry) => JSON.parse(entry).reason).sort(), [
    "missing_token_identity",
    "unknown_role_defaulted",
  ]);
});
