import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getPostLoginRedirect } from "@/lib/auth/redirects";

import { LoginForm } from "./_components/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    const { callbackUrl } = await searchParams;

    redirect(getPostLoginRedirect(session.user.role, callbackUrl));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Masuk</h1>
          <p className="text-sm text-muted-foreground">
            Masuk Untuk melanjutkan ke sistem
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
