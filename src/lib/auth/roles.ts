export const APP_ROLES = ["PM_ADMIN", "DEVELOPER"] as const;

export type AppRole = (typeof APP_ROLES)[number];

type AuthIdentity = {
  id?: unknown;
  role?: unknown;
};

export function isAppRole(role: unknown): role is AppRole {
  return typeof role === "string" && APP_ROLES.includes(role as AppRole);
}

export function isValidAuthIdentity(
  identity: AuthIdentity | null | undefined,
): identity is { id: string; role: AppRole } {
  return (
    typeof identity?.id === "string" &&
    identity.id.length > 0 &&
    isAppRole(identity.role)
  );
}
