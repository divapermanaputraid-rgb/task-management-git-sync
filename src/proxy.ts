import { withAuth } from "next-auth/middleware";
import { logger } from "@/lib/logger";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token }) => {
      const isAuthorized = !!token;

      if (!isAuthorized) {
        logger.warn("access.unauthorized", {
          area: "access",
          action: "middleware_authorized",
          result: "blocked",
          reason: "missing_session_token",
          message: "Request blocked by auth middleware.",
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
