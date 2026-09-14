import { SlideMenuItem } from "./SlideMenuItem";
import { LayoutDashboard, UserRound, Settings } from "lucide-react";
import { LogOutButton } from "./LogOutButton";

type MenuNavbarProps = {
    onClose: () => void;
}

export function MenuNavbar({onClose}: Readonly<MenuNavbarProps>) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      <SlideMenuItem
        icon={LayoutDashboard}
        text="Dashboard"
        href={"/dashboard"}
        closeMenu={onClose}
      />
      <SlideMenuItem icon={Settings} text="Settings" href={"/settings"} closeMenu={onClose} />
      <SlideMenuItem icon={UserRound} text="Profile" href={"/profile"} closeMenu={onClose}/>
      <LogOutButton closeMenu={onClose} />
    </nav>
  );
}
