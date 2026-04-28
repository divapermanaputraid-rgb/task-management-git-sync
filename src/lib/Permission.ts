import type { AppRole } from "./auth/roles";

export function isPmAdmin(role: AppRole) {
  return role === "PM_ADMIN";
}

export function canCreateProject(role: AppRole) {
  return isPmAdmin(role);
}

export function canArchiveProject(role: AppRole) {
  return isPmAdmin(role);
}
