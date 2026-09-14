import type { Note } from "@/lib/types/Note"
import { NoteItem } from "./NoteItem"
type NoteListProps = {
    notes: Note[]
    styling?: string;
    iconColor?: string;
    iconBg?: string;
}

export function NoteList({notes, styling, iconBg, iconColor} : Readonly<NoteListProps>)
{
    return (
        <ul className="flex flex-col gap-2 items-center">
            {notes.map((note) => (
                <NoteItem note={note} iconColor={iconColor} iconBg={iconBg}/>
            ))}
        </ul>
    )
}