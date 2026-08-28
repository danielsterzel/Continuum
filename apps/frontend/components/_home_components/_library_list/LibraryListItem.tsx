"use client";

import type { Library } from "@/types/library";
import { Clapperboard, Trash } from "lucide-react";
import { formatDate } from "@/lib/datetime";
import Link from "next/link";
import { LibraryDeleteModal } from "./LibraryDeleteModal";
import { useEffect, useState } from "react";
import { getDatabase } from "@/lib/db/database";
import { MediaRepository } from "@/lib/db/repositories/media_repository";

type LibraryListItemProps = {
  library: Library;
  onDeleted: () => void;
};

export function LibraryListItem({ library, onDeleted }: Readonly<LibraryListItemProps>) {
  const [show, setShow] = useState(false);
  const [libraryTotalSize, setLibraryTotalSize] = useState(0);

  useEffect(() => {
    async function loadLibrarySize()
    {
      const db = await getDatabase();
      const repository = new MediaRepository(db);

      const totalSize = await repository.getTotalSizeByLibraryId(library.id);
      setLibraryTotalSize(totalSize);
    }

    loadLibrarySize();
  }, [library.id])

  return (
    <>
      <div className="w-full flex flex-col transition-colors duration-200 hover:bg-card-hover">
        <div className="flex items-center">
          <Link
            href={`/library?libraryId=${library.id}`}
            className="flex-1 grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Clapperboard className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <p className="sm:text-base font-medium text-text-primary">{library.name}</p>
            </div>
            <p className="hidden sm:block text-text-secondary text-sm">{}</p>
            <p className="hidden sm:block text-text-secondary text-sm">{formatDate(library.updatedAt)}</p>
            <p className="hidden sm:block text-text-secondary text-sm">{libraryTotalSize ?? "—"}</p>
          </Link>
          <div className="pr-4">
            <div
              onClick={() => setShow(true)}
              className="flex items-center justify-center w-8 h-8 p-1 rounded-lg bg-red-200 text-red-400 transition-colors hover:bg-red-300 duration-300 hover:text-red-500 cursor-pointer"
            >
              <Trash strokeWidth={1} className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-card-border" />
      </div>
      <LibraryDeleteModal libraryId={library.id} show={show} onClose={() => setShow(false)} onDeleted={onDeleted} />
    </>
  );
}
