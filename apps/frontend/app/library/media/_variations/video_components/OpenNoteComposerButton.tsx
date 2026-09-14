import { Plus } from "lucide-react";

type CreateNoteButtonProps = {
  openNoteCreation?: () => void;
};

export function CreateNoteButton({ openNoteCreation}: CreateNoteButtonProps) {
  
  return (
    <button
      type="button"
      onClick={openNoteCreation}
      className="inline-flex shrink-0 cursor-pointer 
      items-center justify-center gap-2 rounded-xl bg-primary
        px-3.5 py-2.5 text-sm font-semibold text-emerald-950
        shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover 
        hover:shadow-md active:translate-y-0 active:scale-[0.98]"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      <p>New note</p>
    </button>
  );
}
