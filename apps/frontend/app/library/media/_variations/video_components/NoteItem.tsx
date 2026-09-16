"use client";

import {useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { Dot } from "lucide-react";
import { PenLine } from "lucide-react";
import type { Note } from "@/lib/types/Note";
import { Trash } from "lucide-react";
import { formatDate } from "@/lib/Datetime";
import { Notebook, Clock, ChevronDown } from "lucide-react";
import { deleteNoteService, updateNoteService } from "@/lib/db/services/note_service";
import { useUser } from "@/app/context/UserContext";
import { useDevice } from "@/app/context/DeviceContext";
import { DeleteNoteModal } from "./DeleteNoteModal";


export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type NoteMetaDataProps = {
  note: Note;
  color: string;
};

function NoteMetaData({ note, color }: NoteMetaDataProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-text-tertiary">
      {note.timestamp !== null && (
        <>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 font-medium tabular-nums ${color}`}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {formatTimestamp(note.timestamp)}
          </span>
          <span className="hidden text-text-tertiary/50 sm:inline-flex"><Dot/></span>
        </>
      )}
      <div className="hidden sm:inline-flex sm:gap-1 sm:items-center sm:font-medium"><Calendar className="w-3 h-3"/><p>{formatDate(new Date(note.createdAt).toISOString())}</p></div>
    </div>
  );
}

export type NoteItemProps = {
  note: Note;
  onNoteUpdated: (note: Note) => void;
  onNoteDeleted: (noteId: string) => void;
  styling?: string;
  iconColor?: string;
  iconBg?: string;
};
export function NoteItem({ note, onNoteUpdated, onNoteDeleted, styling, iconColor, iconBg }: NoteItemProps) {
  const [show, setShow] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const color = iconColor ?? "text-text-tertiary";
  const bg = iconBg ?? "bg-card";

  const textareaInput = useRef<HTMLTextAreaElement | null>(null);

  const {user} = useUser();
  const {device} = useDevice();

  if(!user) return null;
  if(!device) return null;

  const updateNote = async (title?: string, content?: string, timestamp?: number) => {

    const res = await updateNoteService(user.id, note.id, device.id, title, timestamp, content);
    if(!res){throw new Error(`Couldn't update note. Note body: ${JSON.stringify(note)}`)}
  };

  const handleNoteDelete = async() => {
    
    const {deletedNote, success} = await deleteNoteService(user.id, note.id, device.id);
    
    if(!success || !deletedNote) throw Error("Couldn't delete note") // kiedys moze dodam delete failed toast
    
    onNoteDeleted(deletedNote.id);
  }

  return (
    <li
      className={`
      w-full flex flex-col gap-3
      bg-card/60 backdrop-blur-sm border border-card-border/60
      hover:border-card-border hover:bg-card-hover/70
      transition-all duration-300 shadow-sm hover:shadow-md
      p-4 rounded-2xl ${styling ?? ""}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${bg} ${color}`}
          >
            <Notebook className="w-4 h-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-sm font-medium text-text-primary">
              {note.title}
            </p>
            <NoteMetaData note={note} color={color} />
          </div>
        </div>

        <button
        onClick={() => setDeleteModalOpen(true)}
          type="button"
          aria-label="Delete note"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100
          cursor-pointer"
        >
          <Trash className="h-5 w-5 text-danger" />
        </button>

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? "Collapse note" : "Expand note"}
          className="ml-2 shrink-0 w-7 h-7 flex items-center justify-center rounded-full
          text-text-tertiary hover:text-text-primary hover:bg-card-hover
          transition-colors duration-200 cursor-pointer"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${show ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {show && !deleteModalOpen && (
        <>
        <p className="text-xs text-text-tertiary sm:hidden">
          Created{" "}
          <span className="font-medium text-text-secondary">
            {formatDate(new Date(note.createdAt).toISOString())}
          </span>
        </p>
        <textarea
          ref={textareaInput}
          className="
          w-full min-h-28
          resize-none outline-none bg-background/50 border border-card-border/50
          focus:border-card-border rounded-xl p-3
          text-sm text-text-secondary leading-relaxed
          transition-colors duration-200"
          defaultValue={note.content}
        ></textarea>
        </>
      )}
      {show && !deleteModalOpen && (
        <button
        onClick={async() => {
          const newContent = textareaInput.current?.value
          await updateNote(undefined, newContent);
          const updatedNote = {...note, content: newContent!};

          onNoteUpdated(updatedNote);
        }}

        className="flex gap-2 justify-center items-center px-4 py-2 bg-primary border border-card-border rounded-2xl
        shadow-md
         transition-colors hover:bg-primary-hover cursor-pointer active:scale-[0.98] duration-200">
          <PenLine />
          <p className="tracking-widest">Update</p>
         </button>
      )}

      <DeleteNoteModal noteTitle={`${note.title}`} showModal={deleteModalOpen} 
        onExitModal={() => setDeleteModalOpen(false)}
        onDeleteNote={handleNoteDelete}
      />
    </li>
  );
}
