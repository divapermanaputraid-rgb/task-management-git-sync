import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./_components/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
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
