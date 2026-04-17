export function canCreateProject(role: "PM_ADMIN" | "DEVELOPER") {
  return role === "PM_ADMIN";
}
