"use client";

import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

import type { MediaRead } from "@/types/media";

type MediaContextType = {
    media: MediaRead | null;
    setMedia: Dispatch<SetStateAction<MediaRead | null>>
}

const MediaContext = createContext<MediaContextType | null>(null);


export function MediaProvider({children}: {children: React.ReactNode})
{
    const [media, setMedia] = useState<MediaRead | null>(null);
    return <MediaContext.Provider value={{media, setMedia}}>
        {children}
    </MediaContext.Provider>
}

export function useMedia()
{
    const context = useContext(MediaContext);

    if(!context){
        throw new Error("useMedia used not inside MediaProvider");

    }
    return context;
}