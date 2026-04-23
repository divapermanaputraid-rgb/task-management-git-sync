"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppButton } from "@/components/ui/app-button";
import { getSafeCallbackUrl } from "@/lib/auth/redirects";

type LoginFormProps = {
  isGitHubAuthEnabled: boolean;
};

function getOAuthErrorMessage(error: string | null) {
  if (error === "github_identity_incomplete") {
    return "Akun GitHub tidak punya identitas yang cukup untuk masuk.";
  }

  if (error === "github_identity_conflict") {
    return "Akun GitHub ini bentrok dengan user internal yang sudah ada.";
  }

  if (error === "AccessDenied") {
    return "Login GitHub ditolak.";
  }

  if (error === "Configuration") {
    return "Login GitHub belum tersedia.";
  }

  return "";
}

export function LoginForm({ isGitHubAuthEnabled }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeProvider, setActiveProvider] = useState<
    "credentials" | "github" | null
  >(null);

  const callbackUrl =
    getSafeCallbackUrl(searchParams.get("callbackUrl")) || "/";

  const displayErrorMessage =
    errorMessage || getOAuthErrorMessage(searchParams.get("error"));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setActiveProvider("credentials");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setErrorMessage("Login gagal. Silakan coba lagi.");
        setActiveProvider(null);
        return;
      }

      if (result.error) {
        setErrorMessage("Email atau password tidak valid.");
        setActiveProvider(null);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  function handleGitHubSignIn() {
    setErrorMessage("");
    setActiveProvider("github");

    startTransition(() => {
      void signIn("github", {
        callbackUrl,
      });
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

      {displayErrorMessage ? (
        <p className="text-sm text-rose-400">{displayErrorMessage}</p>
      ) : null}

      <AppButton type="submit" className="w-full" disabled={isPending}>
        {isPending && activeProvider === "credentials"
          ? "Sedang masuk..."
          : "Masuk"}
      </AppButton>

      {isGitHubAuthEnabled ? (
        <>
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <p className="relative mx-auto w-fit bg-surface px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              atau
            </p>
          </div>

          <AppButton
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isPending}
            onClick={handleGitHubSignIn}
          >
            {isPending && activeProvider === "github"
              ? "Mengarahkan ke GitHub..."
              : "Masuk dengan GitHub"}
          </AppButton>

          <p className="text-sm text-muted">
            Masuk dengan GitHub untuk membuat akun developer baru secara
            mandiri.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">
          Login GitHub akan muncul setelah konfigurasi OAuth diisi.
        </p>
      )}
    </form>
  );
}
