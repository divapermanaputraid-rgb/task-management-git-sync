import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppSurface } from "@/components/ui/app-surface";
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
      <AppSurface className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Masuk</h1>
          <p className="text-sm text-muted">
            Masuk untuk melanjutkan ke sistem.
          </p>
        </div>

        <LoginForm />
      </AppSurface>
    </main>
  );
}
