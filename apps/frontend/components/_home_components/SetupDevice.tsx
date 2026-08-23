"use client";

import { Smartphone } from "lucide-react";
import type { Device } from "@/types/device";
import { v4 } from "uuid";
import { useRef } from "react";

import { queueEntityChange } from "@/lib/sync/sync";
import { EntityType, SyncOperation } from "@/types/sync_change";
import { useAuth } from "@/hooks/useAuth";


export function SetupDevice({onSubmit}: {onSubmit: () => void})
{
    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
    <div className="bg-card w-full min-h-screen flex flex-col items-center justify-center">
        <div className="w-full flex flex-col gap-4 items-center justify-center">
            <Smartphone className="w-6 h-6 sm:w-32 sm:w-32" />
            <h1 className="text-2xl sm:text-4xl text-text-primary tracking-wide">Setup your device</h1>
            <p className="text-sm sm:text-md text-text-secondary">In order to continue please set up your device by providing a name for it</p>
            
            <input 
            maxLength={50}
            ref={inputRef} type="text" className="focus-none outline-none border px-2 border-card-border rounded-lg" placeholder="Enter your device name"/>
            
            <button onClick={() => {
                
                let userId = localStorage.getItem("user")
                
                if(!userId)
                    {
                        // TODO
                        // userId = v4();
                        const {user} = useAuth();
                        userId = user.id
                        localStorage.setItem("user", userId);
                    }

                const deviceId = v4();
                
                let choosenName;
                if(inputRef.current)
                    {
                        choosenName = inputRef.current.value;
                    }
                else{
                    choosenName = "default"
                }

                const device: Device = {
                    id: deviceId,
                    userId: userId,
                    name: choosenName,
                    lastSeen: new Date().toISOString(),
                    version: 0,
                    entityType: EntityType.Device
                }

                localStorage.setItem("device", JSON.stringify(device));
                queueEntityChange(device, SyncOperation.CREATE);

                onSubmit();

                }} className="bg-primary cursor-pointer  rounded-xl px-4 py-2 transition-colors duration-200 hover:bg-primary-hover">Finish Setup</button>

        </div>
    </div>
);
}