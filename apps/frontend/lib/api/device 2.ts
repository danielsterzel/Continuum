
import type { Device, DeviceWrite } from "@/types/device";

export async function fetchDevice(deviceId: string): Promise<Device>
{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/device/fetch/${deviceId}`);

    if(!res.ok)
        {
            throw new Error(`HTTP error : ${res.status}`)
        }

    return await res.json();

}

export async function createDevice(deviceWrite: DeviceWrite | null): Promise<Device>
{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/device/create`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(deviceWrite)
    });

    if(!res.ok)
        
        {
            throw new Error(`HTTP error : ${res.status}`);
        }

    return res.json();

}