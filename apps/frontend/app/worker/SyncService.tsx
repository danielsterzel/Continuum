"use client";

import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { syncCycle } from "@/lib/sync/sync";
import { useDevice } from "../context/DeviceContext";
import { DeviceNotActiveError } from "@/lib/api/sync";
import { getDatabase } from "@/lib/db/database";
import { DeviceRepository } from "@/lib/db/repositories/device_repository";
import { useRouter } from "next/navigation";

export function SyncService() {
  const { user } = useUser();
  const { device, setDevice } = useDevice();
  const router = useRouter();

  useEffect(() => {
    if (!user || !device) {
      return;
    }

    const runSync = async () => {
      try {
        await syncCycle(user.id);
      } catch (error) {
        if (error instanceof DeviceNotActiveError) {
          const db = await getDatabase();
          await new DeviceRepository(db).remove(device.id);
          setDevice(null);
          router.replace("/setup_device");
          return;
        }
        console.error("SYNC CYCLE ERROR:", error);
      }
    };

    void runSync();

    const interval = setInterval(() => {
      void runSync();
    }, 30_000);

    return () => clearInterval(interval);
  }, [device, router, setDevice, user]);

  return null;
}
