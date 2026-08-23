"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { loginUser } from "@/lib/api/user";
import { getDatabase } from "@/lib/db/database";
import { UserRepository } from "@/lib/db/repositories/user_repository";
import type { UserLogin } from "@/types/user";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Couldn't log you in. Please try again.";
}

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const request: UserLogin = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };

    if (!request.email || !request.password) {
      setError("Enter your email and password to continue.");
      return;
    }

    try {
      setIsSubmitting(true);

      const user = await loginUser(request);
      const db = await getDatabase();
      const userRepository = new UserRepository(db);

      await userRepository.initTable();

      const localUser = await userRepository.get();
      if (!localUser) {
        await userRepository.add(user);
      } else if (localUser.id !== user.id) {
        throw new Error(
          "A different account is already set up on this device.",
        );
      }

      router.replace("/dashboard");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden bg-background px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-primary-subtle/70 blur-3xl" />

      <section className="relative w-full max-w-md animate-fade-in-up overflow-hidden rounded-3xl border border-card-border bg-card px-6 py-8 shadow-[0_24px_70px_-28px_rgba(23,23,23,0.25)] sm:px-10 sm:py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary-subtle shadow-[0_10px_30px_-12px_rgba(52,211,153,0.7)]">
            <ShieldCheck
              className="h-10 w-10 text-primary-active"
              strokeWidth={1.5}
            />
          </div>

          <span className="mb-2 text-xs uppercase tracking-[0.22em] text-emerald-400">
            Welcome back
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Log in to Continuum
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary sm:text-base">
            Access your libraries and continue exactly where you left off.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-5 text-red-700"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-email"
              className="text-sm font-medium text-text-secondary"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                aria-invalid={Boolean(error)}
                className="w-full rounded-xl border border-card-border bg-background-subtle py-3 pl-11 pr-4 text-text-primary shadow-sm outline-none placeholder:text-text-tertiary transition-all duration-200 hover:border-primary/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-text-secondary"
            >
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                maxLength={50}
                aria-invalid={Boolean(error)}
                className="w-full rounded-xl border border-card-border bg-background-subtle py-3 pl-11 pr-12 text-text-primary shadow-sm outline-none placeholder:text-text-tertiary transition-all duration-200 hover:border-primary/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-card hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:from-emerald-500 hover:to-emerald-600 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isSubmitting ? "Logging in…" : "Log in"}
            {!isSubmitting && (
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-text-secondary">
          Don't have an account?{" "}
          <Link
            href="/setup_user"
            className="font-medium text-primary-active transition-colors hover:text-primary-hover"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
