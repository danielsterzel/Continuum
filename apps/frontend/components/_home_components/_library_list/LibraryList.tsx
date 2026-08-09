
import { useLibrary } from "@/app/context/LibraryContext";
import { LibraryListItem } from "./LibraryListItem";



export function LibraryList() {

  const {items, setItems} = useLibrary();


  return (
    <div className="bg-card border border-card-border rounded-xl shadow-xl overflow-hidden max-h-[500px] overflow-y-auto">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2.5 text-text-tertiary text-sm border-b border-card-border bg-background-subtle">
        <p className="pl-10 hidden sm:block">Name</p>
        <p className="hidden sm:block">Files</p>
        <p className="hidden sm:block">Last modified</p>
        <p className="hidden sm:block">Size</p>
      </div>

      <div>
        {items.map((item) => (
          <li key={item.id}>
            <LibraryListItem
              library={item}
              onDeleted={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
            />
          </li>
        ))}
      </div>
    </div>
  );
}
