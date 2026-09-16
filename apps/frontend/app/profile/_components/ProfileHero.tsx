"use client";

import { useDevice } from "@/app/context/DeviceContext";
import { useUser } from "@/app/context/UserContext";
import { formatDate } from "@/lib/Datetime";
import { CalendarDays, Mail, MonitorSmartphone, UserRound } from "lucide-react";

export function ProfileHero() {
  const { user } = useUser();
  const { device } = useDevice();

  if (!user) {
    return (
      <div className="rounded-3xl border border-card-border bg-card p-6 text-sm text-text-secondary shadow-sm">
        Sign in to view your profile.
      </div>
    );
  }

  const initial =
    user.displayName.trim().charAt(0).toUpperCase() ||
    user.email.charAt(0).toUpperCase();

  return (
    <section className="animate-fade-in-up overflow-hidden rounded-3xl border border-card-border bg-card/80 shadow-sm backdrop-blur-sm">
      <div className="border-b border-card-border bg-gradient-to-br from-primary-subtle/80 via-card to-card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-white shadow-md ring-8 ring-white/70">
            {initial || <UserRound className="h-10 w-10" strokeWidth={1.5} />}
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-400" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-active">
              Personal profile
            </p>
            <h2 className="mt-1 break-words text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              {user.displayName}
            </h2>
            <p className="mt-1 break-all text-sm text-text-secondary">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
        <ProfileDetail
          icon={Mail}
          label="Email address"
          value={user.email}
        />
        <ProfileDetail
          icon={CalendarDays}
          label="Member since"
          value={formatDate(user.createdAt)}
        />
        <div className="sm:col-span-2">
          <ProfileDetail
            icon={MonitorSmartphone}
            label="Current device"
            value={device?.name || "Unnamed device"}
          />
        </div>
      </div>
    </section>
  );
}

type ProfileDetailProps = {
  icon: typeof Mail;
  label: string;
  value: string;
};

function ProfileDetail({ icon: Icon, label, value }: ProfileDetailProps) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-card-border bg-background/60 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-active">
        <Icon className="h-5 w-5" strokeWidth={1.7} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-text-primary sm:text-base">
          {value}
        </p>
      </div>
    </div>
  );
}
