import { NotebookPen } from "lucide-react";
export function EmptyNoteListView() {
  return (
    <div className="flex min-h-44 flex-1 flex-col items-center justify-center gap-3 px-5 py-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary-active">
        <NotebookPen className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">No notes yet</p>
        <p className="mt-1 text-xs leading-5 text-text-tertiary">
          Add a note to remember an important moment.
        </p>
      </div>
    </div>
  );
}
