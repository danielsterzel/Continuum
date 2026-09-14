import { SlideMenuItem } from "./SlideMenuItem";
import { LogOutButton } from "./LogOutButton";
import { LayoutDashboard, X, Settings, UserRound } from "lucide-react";
import { MenuNavbar } from "./MenuNavbar";
import { CloseMenuButton } from "./CloseMenuButton";

type MenuBodyProps = {
    isOpen: boolean
    onClose: () => void;
}

export function MenuBody({isOpen, onClose}: Readonly<MenuBodyProps>)
{
    return (
        <div
        className={`fixed top-0 right-0 h-full w-72 bg-card border-l border-card-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-card-border">
          <p className="text-lg font-semibold text-text-primary">Menu</p>

        <CloseMenuButton onClose={onClose}/>
        </div>
        <MenuNavbar onClose={onClose}/>


      </div>
    );
}