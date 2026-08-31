import { useLibrary } from "@/app/context/LibraryContext";
import { LibraryListItem } from "./LibraryListItem";

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
        {items.map((item) => (
          <li key={item.id}>
            <LibraryListItem
              library={item}
              onDeleted={() =>
                setItems((prev) => prev.filter((i) => i.id !== item.id))
              }
            />
          </li>
        ))}
      </div>
    </div>
  );
}
