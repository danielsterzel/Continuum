import { File, X } from "lucide-react";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RenderInputFiles({
  items,
  onDelete,
  onSubmit,
}: Readonly<{
  items: File[];
  onDelete: (index: number) => void;
  onSubmit?: () => void;
}>) {
  const hasFiles = items.length > 0;

  return (
    // Always mounted so the space is reserved from the start. Height animates
    // via grid-template-rows (0fr <-> 1fr) instead of the box popping in/out
    // and shoving the rest of the layout around.
    <div
      className={`grid w-full sm:w-80 transition-[grid-template-rows] duration-300 ease-out ${
        hasFiles ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden min-h-0">
        <div className="flex flex-col gap-2 rounded-2xl border border-card-border bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-medium text-text-primary">Added files</h2>
            <span className="text-xs text-text-tertiary">{items.length}</span>
          </div>

          <ul
            className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1 -mr-1
              [scrollbar-width:thin] [scrollbar-color:var(--card-border)_transparent]"
          >
            {items.map((item, idx) => (
              <li
                key={`${item.name}-${item.lastModified}-${idx}`}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-card-hover transition-colors"
              >
                <File className="w-4 h-4 shrink-0 text-text-tertiary" />
                <span
                  className="min-w-0 flex-1 truncate text-sm text-text-secondary"
                  title={item.name}
                >
                  {item.name}
                </span>
                <span className="shrink-0 text-xs text-text-tertiary">
                  {formatFileSize(item.size)}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(idx)}
                  aria-label={`Remove ${item.name}`}
                  className="shrink-0 rounded-full p-1 text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onSubmit}
            className="mt-1 
            cursor-pointer
            rounded-lg bg-primary py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
