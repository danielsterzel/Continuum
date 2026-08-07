import type { Library } from "@/types/library";
import { Clapperboard } from "lucide-react";
import { formatDate } from "@/lib/datetime";

type LibraryListItemProps = {
  library: Library;
};

export function LibraryListItem({ library }: Readonly<LibraryListItemProps>) {
  return (
    <div className="w-full flex flex-col transition-colors duration-200 hover:bg-card-hover cursor-pointer">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Clapperboard className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <p className="sm:text-base font-medium text-text-primary">{library.name}</p>
        </div>
        <p className="hidden sm:block text-text-secondary text-sm">{library.media ?? "—"}</p>
        <p className="hidden sm:block text-text-secondary text-sm">{formatDate(library.updatedAt)}</p>
        <p className="hidden sm:block text-text-secondary text-sm">{library.size ?? "—"}</p>
      </div>
      <div className="h-px w-full bg-card-border" />
    </div>
  );
}
