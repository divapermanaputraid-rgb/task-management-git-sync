import test from "node:test";
import assert from "node:assert/strict";

import {
  getDefaultAppRoute,
  getLoginRedirectUrl,
  getPostLoginRedirect,
  getSafeCallbackUrl,
} from "../src/lib/auth/redirects";

test("getDefaultAppRoute returns role-based landing page", () => {
  assert.equal(getDefaultAppRoute("PM_ADMIN"), "/dashboard");
  assert.equal(getDefaultAppRoute("DEVELOPER"), "/my-tasks");
});

test("getSafeCallbackUrl accepts safe internal paths", () => {
  assert.equal(getSafeCallbackUrl("/projects"), "/projects");
  assert.equal(
    getSafeCallbackUrl("/projects?page=2#top"),
    "/projects?page=2#top",
  );
});

test("getSafeCallbackUrl rejects unsafe callback values", () => {
  assert.equal(getSafeCallbackUrl(undefined), null);
  assert.equal(getSafeCallbackUrl("https://example.com"), null);
  assert.equal(getSafeCallbackUrl("//example.com"), null);
  assert.equal(getSafeCallbackUrl("/login"), null);
});

test("getLoginRedirectUrl preserves safe internal callback", () => {
  assert.equal(
    getLoginRedirectUrl("/projects"),
    "/login?callbackUrl=%2Fprojects",
  );
  assert.equal(
    getLoginRedirectUrl("/projects?page=2#top"),
    "/login?callbackUrl=%2Fprojects%3Fpage%3D2%23top",
  );
});

test("getLoginRedirectUrl rejects unsafe callback values", () => {
  assert.equal(getLoginRedirectUrl("https://example.com"), "/login");
  assert.equal(getLoginRedirectUrl("//example.com"), "/login");
});

test("getPostLoginRedirect prefers safe callback and falls back to role route", () => {
  assert.equal(getPostLoginRedirect("PM_ADMIN", "/projects"), "/projects");
  assert.equal(
    getPostLoginRedirect("DEVELOPER", "https://example.com"),
    "/my-tasks",
  );
});
