import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getUserByEmail } from "@/lib/auth/queries";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validations/auth";
import { logger } from "@/lib/logger";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email dan Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "nama@newus.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          logger.warn("auth.login_failed", {
            area: "auth",
            action: "login",
            result: "rejected",
            reason: "invalid_login_payload",
          });
          return null;
        }

        const { email, password } = parsed.data;
        const user = await getUserByEmail(email);

        if (!user) {
          logger.warn("auth.login_failed", {
            area: "auth",
            action: "login",
            result: "rejected",
            reason: "user_not_found",
          });
          return null;
        }

        const isPasswordValid = await verifyPassword(
          password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          logger.warn("auth.login_failed", {
            area: "auth",
            action: "login",
            result: "rejected",
            reason: "invalid_password",
            actorUserId: user.id,
            role: user.role,
          });
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role =
          token.role === "PM_ADMIN" || token.role === "DEVELOPER"
            ? token.role
            : "DEVELOPER";

        if (typeof token.id !== "string" || !token.role) {
          logger.warn("auth.session_unexpected_state", {
            area: "auth",
            action: "session",
            result: "recovered",
            reason: "missing_token_identity",
          });
        }

        if (token.role !== "PM_ADMIN" && token.role !== "DEVELOPER") {
          logger.warn("auth.session_unexpected_state", {
            area: "auth",
            action: "session",
            result: "recovered",
            reason: "unknown_role_defaulted",
          });
        }
      }

      return session;
    },
  },
} satisfies NextAuthOptions;

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}

export default NextAuth(authOptions);
