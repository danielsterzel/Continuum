"use client";

import { useDevice } from "@/app/context/DeviceContext";
import { useUser } from "@/app/context/UserContext";
import { GoBackButton } from "@/components/buttons/GoBackButton";
import { getRegisteredDevices, removeRegisteredDevice } from "@/lib/api/device";
import type { DeviceRead } from "@/lib/types/Device";
import {
  CheckCircle2,
  Clock3,
  Laptop,
  LoaderCircle,
  MonitorSmartphone,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useUser();
  const { device: currentDevice } = useDevice();
  const router = useRouter();
  const [devices, setDevices] = useState<DeviceRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceToRemove, setDeviceToRemove] = useState<DeviceRead | null>(null);
  const [removing, setRemoving] = useState(false);

  const loadDevices = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      setDevices(await getRegisteredDevices(user.id));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load registered devices",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    getRegisteredDevices(user.id)
      .then((registeredDevices) => {
        if (!cancelled) setDevices(registeredDevices);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load registered devices",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleRemove = async () => {
    if (!user || !currentDevice || !deviceToRemove || removing) return;

    setRemoving(true);
    setError(null);
    try {
      await removeRegisteredDevice(
        user.id,
        deviceToRemove.id,
        currentDevice.id,
      );
      setDevices((current) =>
        current.filter((device) => device.id !== deviceToRemove.id),
      );
      setDeviceToRemove(null);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Could not remove the device",
      );
      setDeviceToRemove(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-80 h-96 w-96 rounded-full bg-primary-subtle/60 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl">
        <GoBackButton onBack={() => router.back()} />

        <header className="mb-6 animate-fade-in sm:mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-500">
            <Settings2 className="h-4 w-4" />
            Settings
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Registered devices
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
            Devices connected to {user?.email ?? "your account"}. Review their
            latest activity and remove devices you no longer use.
          </p>
        </header>

        <section className="animate-fade-in-up overflow-hidden rounded-3xl border border-card-border bg-card/80 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-card-border bg-gradient-to-br from-primary-subtle/60 via-card to-card p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-primary-active shadow-sm ring-1 ring-primary/10">
                <MonitorSmartphone className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  Your devices
                </h2>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {loading
                    ? "Checking your account…"
                    : `${devices.length} active ${devices.length === 1 ? "device" : "devices"}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadDevices()}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:border-primary/30 hover:text-primary-active disabled:cursor-wait disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <DeviceListSkeleton />
            ) : devices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-card-border bg-background-subtle/50 px-6 py-12 text-center">
                <MonitorSmartphone className="mx-auto h-8 w-8 text-text-tertiary" />
                <p className="mt-3 font-medium text-text-primary">
                  No registered devices found
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Refresh after the next synchronization cycle.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => {
                  const isCurrent = device.id === currentDevice?.id;
                  return (
                    <DeviceRow
                      key={device.id}
                      device={device}
                      current={isCurrent}
                      onRemove={() => setDeviceToRemove(device)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="mt-5 flex gap-3 rounded-2xl border border-primary/15 bg-primary-subtle/35 p-4 text-sm text-text-secondary">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-active" />
          <p className="leading-6">
            The current device cannot be removed here. Removing another device
            disconnects it from future synchronization until it is set up again.
          </p>
        </div>
      </div>

      {deviceToRemove && (
        <RemoveDeviceDialog
          device={deviceToRemove}
          removing={removing}
          onCancel={() => setDeviceToRemove(null)}
          onConfirm={() => void handleRemove()}
        />
      )}
    </main>
  );
}

function DeviceRow({
  device,
  current,
  onRemove,
}: Readonly<{
  device: DeviceRead;
  current: boolean;
  onRemove: () => void;
}>) {
  const recentlyActive = isRecentlyActive(device.lastSeen);

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-card-border bg-background/60 p-4 transition-colors hover:border-primary/25 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-active">
          <Laptop className="h-6 w-6" strokeWidth={1.6} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-text-primary">
              {device.name || "Unnamed device"}
            </h3>
            {current && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Current device
              </span>
            )}
          </div>
          <p className="mt-1 truncate font-mono text-[0.68rem] text-text-tertiary">
            {device.id}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-card-border pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div className="min-w-36">
          <p className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <span
              className={`h-2 w-2 rounded-full ${recentlyActive ? "bg-emerald-400" : "bg-zinc-300"}`}
            />
            {recentlyActive ? "Active recently" : "Last seen"}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
            <Clock3 className="h-3.5 w-3.5" />
            {formatLastSeen(device.lastSeen)}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={current}
          title={
            current ? "The current device cannot be removed" : "Remove device"
          }
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:border-card-border disabled:bg-background-subtle disabled:text-text-disabled"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove {device.name || "device"}</span>
        </button>
      </div>
    </article>
  );
}

function DeviceListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 rounded-2xl border border-card-border p-5"
        >
          <div className="h-12 w-12 rounded-xl bg-background-subtle" />
          <div className="flex-1">
            <div className="h-4 w-40 rounded bg-background-subtle" />
            <div className="mt-2 h-3 w-64 max-w-full rounded bg-background-subtle" />
          </div>
          <div className="hidden h-9 w-32 rounded bg-background-subtle sm:block" />
        </div>
      ))}
    </div>
  );
}

function RemoveDeviceDialog({
  device,
  removing,
  onCancel,
  onConfirm,
}: Readonly<{
  device: DeviceRead;
  removing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-device-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md animate-fade-in-up overflow-hidden rounded-2xl border border-card-border bg-card shadow-2xl"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={removing}
          className="absolute right-4 top-4 cursor-pointer rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-card-hover hover:text-text-secondary disabled:cursor-wait"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pb-6 pt-9 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500">
            <Trash2 className="h-7 w-7" strokeWidth={1.6} />
          </div>
          <h2
            id="remove-device-title"
            className="mt-5 text-xl font-semibold text-text-primary"
          >
            Remove {device.name || "this device"}?
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            It will no longer be registered for this account and must be set up
            again before it can synchronize.
          </p>
        </div>

        <div className="flex gap-3 border-t border-card-border p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={removing}
            className="flex-1 cursor-pointer rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-card-hover disabled:cursor-wait disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={removing}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-wait disabled:opacity-70"
          >
            {removing ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function isRecentlyActive(lastSeen: string): boolean {
  const timestamp = new Date(lastSeen).getTime();
  return Number.isFinite(timestamp) && Date.now() - timestamp < 2 * 60 * 1000;
}

function formatLastSeen(lastSeen: string): string {
  const timestamp = new Date(lastSeen).getTime();
  if (!Number.isFinite(timestamp)) return "Unknown";

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000),
  );
  if (elapsedSeconds < 60) return "Just now";
  if (elapsedSeconds < 3_600) {
    const minutes = Math.floor(elapsedSeconds / 60);
    return `${minutes} min ago`;
  }
  if (elapsedSeconds < 86_400) {
    const hours = Math.floor(elapsedSeconds / 3_600);
    return `${hours} h ago`;
  }

  return new Date(lastSeen).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
