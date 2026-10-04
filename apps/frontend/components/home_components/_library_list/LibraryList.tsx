import { useLibrary } from "@/app/context/LibraryContext";
import { LibraryListItem } from "./LibraryListItem";
import { FolderPlus } from "lucide-react";

export function LibraryList() {
  const { items, setItems } = useLibrary();

  return (
    <div className="max-h-[500px] overflow-hidden overflow-y-auto rounded-2xl border border-card-border bg-card shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_3rem] border-b border-card-border bg-background-subtle/80 px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
          <p className="hidden pl-10 sm:block">Name</p>
          <p className="hidden sm:block">Files</p>
          <p className="hidden sm:block">Last modified</p>
          <p className="hidden sm:block">Size</p>
        </div>
        <span aria-hidden="true" />
      </div>

      <div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary-active">
              <FolderPlus className="h-6 w-6" strokeWidth={1.6} />
            </div>
            <p className="mt-3 font-medium text-text-primary">
              A quiet space, ready for your first library
            </p>
            <p className="mt-1 max-w-sm text-sm text-text-tertiary">
              Create a collection for a course, project, film archive, or
              anything else you want to keep together.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id}>
              <LibraryListItem
                library={item}
                onDeleted={() =>
                  setItems((prev) => prev.filter((i) => i.id !== item.id))
                }
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
