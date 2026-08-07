"use client"

import Link from "next/link"

type LinkPageProps = {
    children: React.ReactNode
    href: string
}

export function LinkPage({children, href}: Readonly<LinkPageProps>)
{
    return(
    <Link 
        href={`${href}`}
        className="
        cursor-pointer p-2 rounded-lg
         bg-gradient-to-r from-green-400 to-emerald-400
         hover:scale-[1.02] will-transform duration-300 ease-In text-white">
            {children}
        </Link>);
}