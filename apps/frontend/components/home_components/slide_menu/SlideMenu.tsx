"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { BlackOverlay } from "@/components/ux/BlackOverlay";
import { OpenMenuButton } from "./OpenMenuButton";
import { MenuBody } from "./MenuBody";

const ALLOWED_PATHS = ["/dashboard", "/library", "/profile"];

export function SlideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const allowed = ALLOWED_PATHS.some((path) => pathname.startsWith(path));

  return (
    <>
      {allowed && (
        <>
          <OpenMenuButton openMenu={() => setIsOpen(true)} />
          {isOpen && <BlackOverlay closeOverlay={() => setIsOpen(false)} />}
          <MenuBody isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      )}
    </>
  );
}
