export function canCreateProject(role: "PM_ADMIN" | "DEVELOPER") {
  return role === "PM_ADMIN";
}

export function canArchiveProject(role: "PM_ADMIN" | "DEVELOPER") {
  return role === "PM_ADMIN";
}
