"use client";

import { useEffect } from "react";
import { batchAndSend } from "@/lib/sync/sync";


export function SyncService()
{
    useEffect(() => {

        const interval = setInterval(() => {
            batchAndSend();
        }, 30_000);

    
        return () => clearInterval(interval);
    });

    return null;
}

