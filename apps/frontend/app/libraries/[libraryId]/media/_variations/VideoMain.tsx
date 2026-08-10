"use client";

import { useParams } from "next/navigation";
import { BASE_PREFIX } from "@/lib/BASE_PREFIX";
import { useMedia } from "@/app/context/MediaContext";
import { ChevronDown, Notebook, Clock, Edit } from "lucide-react";
import { useState, useRef } from "react";

import type { Note } from "@/types/note";
import { getMediaColor, getMediaBg } from "../[mediaId]/page";
import { formatDate } from "@/lib/datetime";

function formatTimestamp(seconds: number) {
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

type NoteItemProps = {
  note: Note;
  styling?: string;
  iconColor?: string;
  iconBg?: string;
};
function NoteItem({ note, styling, iconColor, iconBg }: NoteItemProps) {
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

export function VideoMain() {
  const { libraryId, mediaId } = useParams<{
    libraryId: string;
    mediaId: string;
  }>();
  const { media } = useMedia();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleNoteAdd = () => {
    if (!videoRef.current) {
      return;
    }

    const timestamp = videoRef.current.currentTime;

    console.log("CURR TIMESTAMP: ", timestamp);
  };

  if (!media) {
    return null;
  }
  const color = getMediaColor(media.mediaType);
  const bg = getMediaBg(media.mediaType);

  const noteMock: Note = {
    id: "MOCK_ID",
    mediaId: media?.id,
    media: media,
    title: "This is a Note title",
    content:
      "This is some sort of text area and here I will have" +
      "the like... timestamp where the note is and the note description etc etc.",
    timestamp: 125,
    deleted_at: null,
    createdAt: 0,
    updatedAt: 0,
  };

  return (
    <div className="w-full flex flex-col items-center sm:block">
      <button
        type="button"
        onClick={handleNoteAdd}
        className="
        mb-4 inline-flex items-center gap-2
        px-12 py-2 rounded-2xl
        bg-primary text-emerald-950 text-sm font-medium
        shadow-lg shadow-primary/20
        hover:bg-primary-hover hover:shadow-xl 
        active:scale-[0.98]
        transition-all duration-200
        cursor-pointer"
      >
        <Edit className="w-4 h-4 transition-transform duration-200 " />
        <span>New Note</span>
      </button>
      <div className="relative w-full flex flex-col sm:grid sm:grid-cols-4 sm:items-start gap-6">
        <ul className="order-2 sm:order-1 sm:col-span-1 w-full flex flex-col gap-3 items-center">
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
        </ul>

        <div
          className="
        order-1 sm:order-2
        bg-black
        rounded-2xl
        sm:col-span-3 sm:sticky sm:top-24 sm:self-start min-h-0 sm:min-h-[70vh] w-full flex items-center justify-center"
        >
          <video
            ref={videoRef}
            controls
            className="w-full max-w-[240px] sm:max-w-[480px] max-h-[350px] sm:max-h-[560px] rounded-xl"
          >
            <source
              src={`${BASE_PREFIX}/media_storage/${libraryId}/${mediaId}/${media?.filename}`}
              type="video/mp4"
            />
          </video>
        </div>
      </div>
    </div>
  );
}
