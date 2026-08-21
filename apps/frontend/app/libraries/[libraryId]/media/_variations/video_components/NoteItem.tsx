"use client";

import { useState } from "react";
import type { NoteRead } from "@/types/note";
import { formatDate } from "@/lib/datetime";
import { Notebook, Clock, ChevronDown } from "lucide-react";


function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type NoteMetaDataProps = {
  note: NoteRead;
  color: string;
};



function NoteMetaData({ note, color }: NoteMetaDataProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-text-tertiary">
      {note.timestamp !== null && (
        <>
          <span
            className={`inline-flex items-center gap-1 font-medium ${color}`}
          >
            <Clock className="w-3 h-3" />
            {formatTimestamp(note.timestamp)}
          </span>
          <span className="text-text-tertiary/50">•</span>
        </>
      )}
      <span>{formatDate(new Date(note.createdAt).toISOString())}</span>
    </div>
  );
}

export type NoteItemProps = {
  note: NoteRead;
  styling?: string;
  iconColor?: string;
  iconBg?: string;
};
export function NoteItem({ note, styling, iconColor, iconBg }: NoteItemProps) {
  const [show, setShow] = useState(false);
  const color = iconColor ?? "text-text-tertiary";
  const bg = iconBg ?? "bg-card";

  return (
    <li
      className={`
      w-full flex flex-col gap-3
      bg-card/60 backdrop-blur-sm border border-card-border/60
      hover:border-card-border hover:bg-card-hover/70
      transition-all duration-300 shadow-sm hover:shadow-md
      p-4 rounded-2xl ${styling ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${bg} ${color}`}
          >
            <Notebook className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <p className="text-text-primary text-sm font-medium truncate">
              {note.title}
            </p>
            <NoteMetaData note={note} color={color} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? "Collapse note" : "Expand note"}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full
          text-text-tertiary hover:text-text-primary hover:bg-card-hover
          transition-colors duration-200 cursor-pointer"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${show ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {show && (
        <textarea
          className="
          w-full min-h-28
          resize-none outline-none bg-background/50 border border-card-border/50
          focus:border-card-border rounded-xl p-3
          text-sm text-text-secondary leading-relaxed
          transition-colors duration-200"
          defaultValue={note.content}
        ></textarea>
      )}
    </li>
  );
}
