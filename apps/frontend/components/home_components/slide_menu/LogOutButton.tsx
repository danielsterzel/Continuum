"use client";

import { useUser } from "@/app/context/UserContext";
import { deleteLocalUserAfterLogout } from "@/lib/db/services/user_service";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ErrorLogoutToast } from "./ErrorLogoutToast";


type LogOutButtonProps = {
    closeMenu: () => void;
}
export function LogOutButton({closeMenu}: Readonly<LogOutButtonProps>)
{   
    const [logoutToast, setLogoutToast] = useState(false);

    const {user, setUser} = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!logoutToast) return;

        const timeoutId = window.setTimeout(() => {
            setLogoutToast(false);
        }, 5000);

        return () => window.clearTimeout(timeoutId);
    }, [logoutToast]);

    if(!user) return null;

    async function onPress() {
        const result = await deleteLocalUserAfterLogout();
        if(!result)
        {
            setLogoutToast(true);
            return;
        }
        closeMenu();
        setUser(null);
        router.replace("/");

    }

    return (
    <>
    <button 
        onClick={onPress}
        className="flex gap-2 px-3 py-2.5 rounded-lg text-text-secondary 
        hover:bg-primary hover:text-text-primary transition-colors duration-200">
        <LogOut className="w-6 h-6"/>
        <p>Sign out</p>
    </button>

    {logoutToast && (
        <ErrorLogoutToast onClose={() => setLogoutToast(false)} />
    )}
    </>
    );
}
