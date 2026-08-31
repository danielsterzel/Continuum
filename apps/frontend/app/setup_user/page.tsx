"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  UserRoundPlus,
} from "lucide-react";

import { createUser } from "@/lib/api/user";
import type { UserSetupRequest, User } from "@/lib/types/User";
import { UserRepository } from "@/lib/db/repositories/user_repository";
import { getDatabase } from "@/lib/db/database";
import { useUser } from "../context/UserContext";
import { useDevice } from "../context/DeviceContext";


function getPasswordError(password: string): string | null {
  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }

  return null;
}

export default function SetupUser() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {user} = useUser();
  const {device} = useDevice();

  useEffect(() => {
    if(user && device)
      {
        router.replace("/dashboard")
        return;
      }
    if(user && !device)
      {
        router.replace("/setup_device");
        return;
      }
  }, [user, router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const request: UserSetupRequest = {
      displayName: String(formData.get("displayName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };

    if (!request.displayName || !request.email || !request.password) {
      setError("Complete all fields to create your account.");
      return;
    }

    const passwordError = getPasswordError(request.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setIsSubmitting(true);
      const user: User = await createUser(request);

      const db = await getDatabase();
      const userRepository = new UserRepository(db);
      
      await userRepository.add(user);
      router.replace("/login");
    } catch (submitError) {
      console.error("Account creation failed:", submitError);
      setError("Couldn't create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden bg-background px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-primary-subtle/70 blur-3xl" />

      <section className="relative w-full max-w-lg animate-fade-in-up overflow-hidden rounded-3xl border border-card-border bg-card px-6 py-8 shadow-[0_24px_70px_-28px_rgba(23,23,23,0.25)] sm:px-10 sm:py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary-subtle shadow-[0_10px_30px_-12px_rgba(52,211,153,0.7)]">
            <UserRoundPlus
              className="h-10 w-10 text-primary-active"
              strokeWidth={1.5}
            />
          </div>

          <span className="mb-2 text-xs uppercase tracking-[0.22em] text-emerald-400">
            Get started
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary sm:text-base">
            Set up your profile to keep your libraries connected across devices.
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
              htmlFor="setup-display-name"
              className="text-sm font-medium text-text-secondary"
            >
              Display name
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                id="setup-display-name"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                aria-invalid={Boolean(error)}
                className="w-full rounded-xl border border-card-border bg-background-subtle py-3 pl-11 pr-4 text-text-primary shadow-sm outline-none placeholder:text-text-tertiary transition-all duration-200 hover:border-primary/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15"
                placeholder="How should we call you?"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="setup-email"
              className="text-sm font-medium text-text-secondary"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                id="setup-email"
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
              htmlFor="setup-password"
              className="text-sm font-medium text-text-secondary"
            >
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                id="setup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={50}
                aria-invalid={Boolean(error)}
                className="w-full rounded-xl border border-card-border bg-background-subtle py-3 pl-11 pr-12 text-text-primary shadow-sm outline-none placeholder:text-text-tertiary transition-all duration-200 hover:border-primary/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15"
                placeholder="Create a secure password"
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
            <p className="text-xs leading-5 text-text-tertiary">
              Use 8–50 characters with uppercase, lowercase and a number.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:from-emerald-500 hover:to-emerald-600 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
            {!isSubmitting && (
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-active transition-colors hover:text-primary-hover"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
