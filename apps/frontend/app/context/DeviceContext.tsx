
"use client";

import { useState, createContext, Dispatch, SetStateAction, useContext, useEffect } from "react";

import type { Device } from "@/lib/types/Device";
import { getDatabase } from "@/lib/db/database";
import { DeviceRepository } from "@/lib/db/repositories/device_repository";

type DeviceContextType = {
    device: Device | null;
    setDevice: Dispatch<SetStateAction<Device | null>>;
}
const DeviceContext = createContext<DeviceContextType | null>(null);

export function DeviceProvider({children}: {children : React.ReactNode})
{
    const [device, setDevice] = useState<Device| null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function loadDevice()
        {
            const db = await getDatabase();
            const repository = new DeviceRepository(db);

            const localDevice = await repository.get();

            setDevice(localDevice);
            setLoaded(true);

        }

        loadDevice();
    }, []);

    if(!loaded){
        return null;
    }

    return <DeviceContext.Provider value={{device, setDevice}}>
        {children}
    </DeviceContext.Provider>
}

export function useDevice()
{
    const context = useContext(DeviceContext);

    if(!context)
        {
        throw new Error("useDevice used outside of DeviceProvider");

        }
    return context;
}
