export type AppRole = "PM_ADMIN" | "DEVELOPER";

export function isPmAdmin(role: AppRole) {
  return role === "PM_ADMIN";
}

export function canCreateProject(role: AppRole) {
  return isPmAdmin(role);
}

export function canArchiveProject(role: AppRole) {
  return isPmAdmin(role);
}
