"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Settings, UserRound, LogOut, Menu, X } from "lucide-react";
import { SlideMenuItem } from "./SlideMenuItem";
import { LogOutButton } from "./LogOutButton";
import { BlackOverlay } from "@/components/ux/BlackOverlay";
import { OpenMenuButton } from "./OpenMenuButton";
import { MenuBody } from "./MenuBody";

export function SlideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/library")) {
    return null;
  }

  return (
    <>
      <OpenMenuButton openMenu={() => setIsOpen(true)}/>
      {isOpen && (
        <BlackOverlay closeOverlay={() => setIsOpen(false)}/>
      )}
      <MenuBody isOpen={isOpen} onClose={() => setIsOpen(false)}/>
    </>
  );
}
