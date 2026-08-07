
import type { Library } from "@/types/library";
import { Clapperboard } from "lucide-react";
import { formatDate } from "@/lib/datetime";

type LibraryListItemProps = {
  library: Library;
};

export function LibraryListItem({ library }: Readonly<LibraryListItemProps>) {
  return (
    <div 
    className="w-full flex flex-col transition-colors duration-200 hover:bg-card-hover cursor-pointer rounded-lg">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-2 py-2">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Clapperboard className="w-5 h-5 text-primary" />
          </div>

          <p className="sm:text-xl">{library.name}</p>
        </div>
        <p className="hidden sm:block">{library.media ?? "-"}</p>
        <p className="hidden sm:block">{formatDate(library.updatedAt)}</p>
        <p className="hidden sm:block">{library.size ?? "-"}</p>
      </div>
      <div className="h-px w-full bg-neutral-300" />
    </div>
  );
}
