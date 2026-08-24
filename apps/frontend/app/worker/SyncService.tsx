"use client";

import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { syncCycle } from "@/lib/sync/sync";

export function SyncService() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      return;
    }

    const runSync = async () => {
      try {
        await syncCycle(user.id);
      } catch (error) {
        console.error("SYNC CYCLE ERROR:", error);
      }
    };

    void runSync();

    const interval = setInterval(() => {
      void runSync();
    }, 30_000);

    return () => clearInterval(interval);
  }, [user]);

  return null;
}