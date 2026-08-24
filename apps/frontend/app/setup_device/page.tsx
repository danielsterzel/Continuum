"use client";

import { ArrowRight, Smartphone } from "lucide-react";
import type { Device } from "@/types/device";
import { v4 } from "uuid";
import { useRef, useEffect  } from "react";
import { EntityType, SyncOperation } from "@/types/sync_change";
import { useRouter } from "next/navigation";
import { DeviceRepository } from "@/lib/db/repositories/device_repository";
import { getDatabase } from "@/lib/db/database";
import { useUser } from "../context/UserContext";
import { useDevice } from "../context/DeviceContext";
import { enqueueChange } from "@/lib/sync/queue";
import { queueEntityChange } from "@/lib/sync/sync";

export default function SetupDevice() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {user} = useUser();
  const {device, setDevice} = useDevice();


  const router = useRouter();

  useEffect(() => {
  if (!user) {
    router.replace("/setup_user");
    return;
  }

  if (device) {
    router.replace("/dashboard");
  }
}, [user, device, router]);

  async function handleDeviceSubmit() {

    if (!user) {
      router.replace("/setup_user");
      return;
    }

    const db = await getDatabase();
    const deviceRepository = new DeviceRepository(db);

    const newDevice: Device = {
      userId: user.id,
      id: v4(),
      name: inputRef.current?.value || "default",
      lastSeen: new Date().toISOString(),
      version: 1,
      entityType: EntityType.Device,
    };

    await deviceRepository.add(newDevice);
    await queueEntityChange(newDevice, SyncOperation.CREATE, newDevice.id);
    
    setDevice(newDevice);

    router.replace("/dashboard");
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-primary-subtle/70 blur-3xl" />

      <div className="relative w-full max-w-lg animate-fade-in-up overflow-hidden rounded-3xl border border-card-border bg-card px-6 py-8 shadow-[0_24px_70px_-28px_rgba(23,23,23,0.25)] sm:px-10 sm:py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary-subtle shadow-[0_10px_30px_-12px_rgba(52,211,153,0.7)] sm:h-24 sm:w-24">
            <Smartphone
              className="h-10 w-10 text-primary-active sm:h-12 sm:w-12"
              strokeWidth={1.5}
            />
          </div>

          <span className="mb-2 text-xs uppercase tracking-[0.22em] text-emerald-400">
            One last step
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Setup your device
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary sm:text-base">
            Give this device a name so you can easily recognize it later.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="device-name"
            className="text-sm font-medium text-text-secondary"
          >
            Device name
          </label>
          <input
            id="device-name"
            maxLength={50}
            ref={inputRef}
            type="text"
            className="w-full rounded-xl border border-card-border bg-background-subtle px-4 py-3 text-text-primary shadow-sm outline-none placeholder:text-text-tertiary transition-all duration-200 hover:border-primary/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15"
            placeholder="e.g. Daniel's MacBook"
          />
          <p className="text-xs text-text-tertiary">
            You can use up to 50 characters.
          </p>
        </div>

        <button
          onClick={() => {
            handleDeviceSubmit();
          }}
          className="group mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:from-emerald-500 hover:to-emerald-600 hover:shadow-md active:scale-[0.99]"
        >
          Finish setup
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
