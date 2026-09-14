import { type LucideIcon } from "lucide-react";
import Link from "next/link";
type SlideMenuItemProps = {
    icon: LucideIcon
    text: string
    href?: string
    closeMenu: () => void
}

export function SlideMenuItem({icon: Icon, text, closeMenu, href = "#"}: Readonly<SlideMenuItemProps>)
{   
    const pageLink = `${href}`
    return (
        <Link
            href={`${pageLink}`}
            onClick={closeMenu}
            className="flex gap-2 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-primary hover:text-text-primary transition-colors duration-200"
        >
            <Icon className="w-6 h-6"/>
            <p>{text}</p>
        </Link>);
}