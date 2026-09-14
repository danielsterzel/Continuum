"use client";

import { useDevice } from "@/app/context/DeviceContext";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export function VerifyUserAndDevice({children}: {children: React.ReactNode})
{
    const {user} = useUser();
    const {device} = useDevice();
    const router = useRouter();
    useEffect(() => {

        if(!user)
            {   
                router.replace("/login");
                return;
            }
        if(!device)
            {
                router.replace("/setup_device");
                return;
            }
    }, [user, device, router]);

    return children;

}
