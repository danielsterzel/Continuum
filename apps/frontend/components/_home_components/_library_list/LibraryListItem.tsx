"use client";

import type { Library } from "@/types/library";
import { Clapperboard, Trash } from "lucide-react";
import { formatDate } from "@/lib/datetime";
import { deleteLibrary } from "@/lib/api/library";
import { LibraryDeleteModal } from "./LibraryDeleteModal";
import { useState } from "react";
type LibraryListItemProps = {
  library: Library;
  onDeleted: () => void;
};



export function LibraryListItem({ library, onDeleted }: Readonly<LibraryListItemProps>) {

  const [show, setShow] = useState(false);
  return (
    <div className="w-full flex flex-col transition-colors duration-200 hover:bg-card-hover cursor-pointer">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Clapperboard className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <p className="sm:text-base font-medium text-text-primary">{library.name}</p>
        </div>
        <p className="hidden sm:block text-text-secondary text-sm">{library.media ?? "—"}</p>
        <p className="hidden sm:block text-text-secondary text-sm">{formatDate(library.updatedAt)}</p>
        <p className="hidden sm:block text-text-secondary text-sm">{library.size ?? "—"}</p>
        <div 
        onClick={() => setShow(true)}
        className="
        flex items-center jusitify-center
        w-8 h-8
        p-1 rounded-lg bg-red-200 text-red-400 tranisiton-colors hover:bg-red-300 duration-300 hover:text-red-500">
          <Trash strokeWidth={1} className="w-6 h-6"/></div>
      </div>
      
      <div className="h-px w-full bg-card-border" />
      <LibraryDeleteModal libraryId={library.id} userId={"76d06599-1154-4c60-b39e-6b9f6bba2046"} show={show} onClose={() => setShow(false)} onDeleted={onDeleted}/>
    </div>
  );
}
