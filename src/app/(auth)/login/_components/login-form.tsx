// src/app/(auth)/login/_components/login-form.tsx
"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppButton } from "@/components/ui/app-button";
import { getSafeCallbackUrl } from "@/lib/auth/redirects";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const callbackUrl =
    getSafeCallbackUrl(searchParams.get("callbackUrl")) || "/";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setErrorMessage("Login gagal. Silakan coba lagi.");
        return;
      }

      if (result.error) {
        setErrorMessage("Email atau password tidak valid.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nama@perusahaan.com"
          className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent/40"
          autoComplete="email"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Masukkan password Anda."
          className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent/40"
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>

      {errorMessage ? (
        <p className="text-sm text-rose-400">{errorMessage}</p>
      ) : null}

      <AppButton type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sedang masuk..." : "Masuk"}
      </AppButton>
    </form>
  );
}
