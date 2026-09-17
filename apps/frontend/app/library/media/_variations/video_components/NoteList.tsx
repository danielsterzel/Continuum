import type { Note } from "@/lib/types/Note"
import { NoteItem } from "./NoteItem"
type NoteListProps = {
    notes: Note[];
    onNoteUpdated: (note: Note) => void;
    onNoteDeleted: (noteId: string) => void;
    getCurrentTimestamp: () => number | null;
    styling?: string;
    iconColor?: string;
    iconBg?: string;
}

export function NoteList({notes, onNoteUpdated, onNoteDeleted, getCurrentTimestamp, styling, iconBg, iconColor} : Readonly<NoteListProps>)
{
    return (
        <ul className="flex flex-col gap-2 items-center">
            {notes.map((note) => (
                <NoteItem
                    note={note}
                    key={note.id}
                    iconColor={iconColor}
                    iconBg={iconBg}
                    onNoteUpdated={onNoteUpdated}
                    onNoteDeleted={onNoteDeleted}
                    getCurrentTimestamp={getCurrentTimestamp}
                />
            ))}
        </ul>
    )
}
