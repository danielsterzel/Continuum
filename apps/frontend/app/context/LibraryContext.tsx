"use client";

import { createContext, Dispatch, SetStateAction, useContext, useState} from "react";

import type { LibraryRead } from "@/types/library";

type LibraryContextType = {
    items: LibraryRead[];
    setItems: Dispatch<SetStateAction<LibraryRead[]>>;
}

const LibraryContext = createContext<LibraryContextType | null> (null);

export function LibraryProvider({children} : {children: React.ReactNode})
{
    const [items, setItems] = useState<LibraryRead[]>([]);

    return (<LibraryContext.Provider value={{items, setItems}}>
        {children}
    </LibraryContext.Provider>)
}

export function useLibrary()
{
    const context = useContext(LibraryContext);

    if(!context)
        {
            throw new Error("useLibrary not used inside LibraryProvider")
        }

    return context;
}
