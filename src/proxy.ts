import { withAuth } from "next-auth/middleware";

import { logger } from "@/lib/logger";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ req, token }) => {
      const isAuthorized = !!token;

      if (!isAuthorized) {
        logger.warn("access.unauthorized", {
          area: "access",
          action: "guard_route",
          result: "blocked",
          reason: "missing_session_token",
          requestPath: req.nextUrl.pathname,
        });
      }

      return isAuthorized;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/my-tasks/:path*",
    "/settings/:path*",
  ],
};
