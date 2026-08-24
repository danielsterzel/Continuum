"use client";

import { useEffect } from "react";
import { batchAndSend } from "@/lib/sync/sync";
import { useUser } from "../context/UserContext";


export function SyncService()
{   
    const {user} = useUser();


    useEffect(() => {
        if(!user)
        {
            return;
        }
        console.log("I AM WORKING");
        const interval = setInterval(async () => {
            await batchAndSend(user.id);
        }, 30_000);

    
        return () => clearInterval(interval);
    }, [user]);

    return null;
}

