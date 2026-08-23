"use client";

import { useEffect, useState } from "react";
import { initializeDatabase } from "@/lib/db/initialize";

export function BootstrapDb({ children }: { children: React.ReactNode }) {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeDatabase();
      setDbReady(true);
    }

    init();
  }, []);
  if (!dbReady) {
    return null;
  }

  return children;
}
