"use client";

import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

import type { Media } from "@/lib/types/Media";

type MediaContextType = {
    media: Media | null;
    setMedia: Dispatch<SetStateAction<Media | null>>
}

const MediaContext = createContext<MediaContextType | null>(null);


export function MediaProvider({children}: {children: React.ReactNode})
{
    const [media, setMedia] = useState<Media | null>(null);
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