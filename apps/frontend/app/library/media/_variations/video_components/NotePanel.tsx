
import { CreateNoteButton } from "./OpenNoteComposerButton";
import { useEffect, useState } from "react";
import { NoteComposer } from "./NoteComposer";
import { Note } from "@/lib/types/Note";
import { getAllNotesForMedia } from "@/lib/db/services/note_service";
import { useUser } from "@/app/context/UserContext";
import { useSearchParams } from "next/navigation";
import { EmptyNoteListView } from "./EmptyNoteListView";
import { NoteList } from "./NoteList";

type NotePanelProps = {
  showComposer: boolean
  onExitCloseComposer: () => void;
  openNoteCreation?: () => void;
  currTimestamp: number;
};

export function NotePanel({currTimestamp, showComposer, onExitCloseComposer, openNoteCreation}: NotePanelProps) {

  const [notes, setNotes] = useState<Note[]>([]);
  const {user} = useUser();

  const searchParams = useSearchParams();

  const mediaId = searchParams.get("mediaId");

  useEffect(() => {

    if(!user) return;
    if(!mediaId) return;
    const getNotes = async() =>
    {
      setNotes(await getAllNotesForMedia(user.id, mediaId));
    }
    getNotes();

  }, [user, mediaId])

  return (
    <aside className="order-2 flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-card-border bg-card/80 shadow-sm sm:order-1 sm:col-span-1 sm:max-h-[70vh] sm:sticky sm:top-24 sm:self-start">
      <header className="flex items-center justify-between gap-3 border-b border-card-border p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-400">
            Your thoughts
          </p>
          <h2 className="mt-0.5 text-xl font-semibold text-text-primary">
            Notes
          </h2>
        </div>

        <CreateNoteButton openNoteCreation={openNoteCreation}/>
      </header>

      <NoteComposer currTimestamp={currTimestamp} showComposer={showComposer} onExitCloseComposer={onExitCloseComposer}/>
      {notes.length === 0 ? <EmptyNoteListView />: <NoteList notes={notes}/>}
    </aside>
  );
}
