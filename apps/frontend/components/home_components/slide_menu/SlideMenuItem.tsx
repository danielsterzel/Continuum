import { type LucideIcon } from "lucide-react";

type SlideMenuItemProps = {
    icon: LucideIcon
    text: string
    href?: string
}

export function SlideMenuItem({icon: Icon, text, href = "#"}: Readonly<SlideMenuItemProps>)
{
    return (
        <a
            href={`${href}`}
            className="flex gap-2 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-primary hover:text-text-primary transition-colors duration-200"
        >
            <Icon className="w-6 h-6"/>
            <p>{text}</p>
        </a>);
}