"use client";

import { createContext, Dispatch, SetStateAction, useContext, useState} from "react";

import type { Library } from "@/lib/types/Library";

type LibraryContextType = {
    items: Library[];
    setItems: Dispatch<SetStateAction<Library[]>>;
}

const LibraryContext = createContext<LibraryContextType | null> (null);

export function LibraryProvider({children} : {children: React.ReactNode})
{
    const [items, setItems] = useState<Library[]>([]);

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
