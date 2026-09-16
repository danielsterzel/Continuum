import { TriangleAlert, Trash2, X } from "lucide-react";

type DeleteNoteModalProps = {
  noteTitle: string;
  showModal: boolean;
  onExitModal: () => void;
  onDeleteNote: () => Promise<void>;
};

export function DeleteNoteModal({
  noteTitle,
  showModal,
  onDeleteNote,
  onExitModal,

}: Readonly<DeleteNoteModalProps>) {

    if(!showModal) return null;
  return (
    <div
      role="alertdialog"
      aria-label="Delete note"
      className="animate-fade-in overflow-hidden rounded-xl border border-red-200/70 bg-red-50/70"
    >
      <div className="flex items-start gap-3 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary">
            Delete this note?
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">{noteTitle}</span>{" "}
            will be permanently deleted.
          </p>
        </div>

        <button
        onClick={onExitModal}
          type="button"
          aria-label="Cancel deleting note"
          className="cursor-pointer rounded-lg p-1 text-text-tertiary transition-colors hover:bg-red-100 hover:text-text-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex gap-2 border-t border-red-200/70 p-3">
        <button
        onClick={onExitModal}
          type="button"
          className="flex-1 cursor-pointer rounded-lg border border-card-border bg-card px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-card-hover"
        >
          Cancel
        </button>
        <button
        onClick={async () => {
            await onDeleteNote();
            onExitModal();
        }}
          type="button"
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </button>
      </div>
    </div>
  );
}
