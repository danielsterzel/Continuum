import { Menu } from "lucide-react"

type OpenMenuButton = {
    openMenu: () => void;
}

export function OpenMenuButton({openMenu}: Readonly<OpenMenuButton>)
{
    return(
    <button
    onClick={openMenu}
    className="cursor-pointer fixed top-6 right-6 z-40 w-10 h-10 flex items-center justify-center rounded-xl shadow-md bg-primary hover:bg-primary-hover transition-colors duration-200"
    aria-label="Open menu"
    >
        <Menu className="w-6 h-6"/>
    </button>);
}