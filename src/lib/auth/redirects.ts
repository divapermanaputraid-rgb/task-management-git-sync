const defaultAppRoutes = {
  PM_ADMIN: "/dashboard",
  DEVELOPER: "/my-tasks",
} as const;

export function getDefaultAppRoute(role: keyof typeof defaultAppRoutes) {
  return defaultAppRoutes[role];
}

export function getSafeCallbackUrl(callbackUrl?: string | string[] | null) {
  const value = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;

  if (!value) {
    return null;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  const normalizedCallbackUrl = new URL(value, "http://localhost");

  if (normalizedCallbackUrl.pathname === "/login") {
    return null;
  }

  return `${normalizedCallbackUrl.pathname}${normalizedCallbackUrl.search}${normalizedCallbackUrl.hash}`;
}
export function getLoginRedirectUrl(callbackUrl?: string | string[] | null) {
  const SafeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  if (!SafeCallbackUrl) {
    return "/login";
  }

  return `/login?callbackUrl=${encodeURIComponent(SafeCallbackUrl)}`;
}

export function getPostLoginRedirect(
  role: keyof typeof defaultAppRoutes,
  callbackUrl?: string | string[] | null,
) {
  return getSafeCallbackUrl(callbackUrl) ?? getDefaultAppRoute(role);
}
