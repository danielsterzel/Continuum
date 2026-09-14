"use client";
import { useDevice } from "@/app/context/DeviceContext";
import { saveNoteToDbAndPushToQueue } from "@/lib/db/services/note_service";
import { EntityType } from "@/lib/types/EntityType";
import { Note } from "@/lib/types/Note";
import { X, PenBox, ClockFading, TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { v4 } from "uuid";
import { formatTimestamp } from "./NoteItem";

type NoteComposerProps = {
  showComposer: boolean;
  onExitCloseComposer: () => void;
  currTimestamp: number;
};
export function NoteComposer({
  currTimestamp,
  showComposer,
  onExitCloseComposer,
}: Readonly<NoteComposerProps>) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [writtenNote, setWrittenNote] = useState<Partial<Note>>();
  const [currContentLength, setCurrContentLength] = useState(0);
  const [errToast, setErrToast] = useState(false);

  const { device } = useDevice();

  const searchParams = useSearchParams();
  const mediaId = searchParams.get("mediaId");
  const textTimestamp = formatTimestamp(currTimestamp);


  if (!mediaId) {
    throw new Error("Media Id is missing from URL");
  }

  const createNote = async () => {
    const note: Note = {
      ...writtenNote as Note,
      id: v4(),
      mediaId: mediaId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      timestamp: currTimestamp,
      entityType: EntityType.Note,
      version: 0
    };

    const noteAddStatus = await saveNoteToDbAndPushToQueue(note, device!.id);
    if (!noteAddStatus) {
      setErrToast(true);
      return;
    }

    onExitCloseComposer();

  };

  if (!showComposer) return;

  return (
    <div className="flex flex-col gap-2 m-2">
      <div className="w-full flex flex-col gap-2 items-center justify-center">
        <div className="bg-primary-subtle rounded-2xl p-2">
          <ClockFading className="w-12 h-12 text-primary" />
        </div>
        <p
          className="text-sm bg-card 
                text-text-tertiary
                rounded-2xl "
        >
          {textTimestamp}
        </p>

        <input
          maxLength={50}
          onChange={(e) => {
            setWrittenNote((prev) => ({ ...prev, title: e.target.value }));
          }}
          placeholder="My awesome title"
          type="text"
          className="
            text-center
            text-lg text-text-secondary border-b border-neutral-500 focus-none outline-none"
        />
      </div>

      <div className="w-full flex items-center justify-center bg-card">
        <textarea
          maxLength={300}
          placeholder="Type here ..."
          onChange={(e) => {
            setWrittenNote((prev) => ({
              ...prev,
              content: e.target.value,
            }));
            setCurrContentLength(e.target.textLength);
          }}
          ref={inputRef}
          className="p-2 w-84 h-32 resize-none border  
            border-card-border
            rounded-2xl
            focus-none
            outline-none
            "
        />
      </div>
      <div className="text-text-tertiary">{currContentLength} / 300</div>

      <div className="w-full flex justify-between">
        <button
          className="cursor-pointer
            w-32 flex items-center justify-center
            bg-red-200 text-danger rounded-full
            "
          onClick={onExitCloseComposer}
        >
          <X className="w-6 h-6" />
          Cancel
        </button>
        <button
          onClick={createNote}
          className="
            w-32
            bg-primary rounded-full p-2
            text-text-emerald
            flex gap-2 items-center justify-center cursor-pointer"
        >
          Write
          <PenBox className="w-6 h-6" />
        </button>
      </div>
      <ErrToast showToast={errToast} closeToast={() => setErrToast(false)} />
    </div>
  );
}

function ErrToast({
  showToast,
  closeToast,
}: {
  showToast: boolean;
  closeToast: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      closeToast();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [showToast, closeToast]);

  if (!showToast) return null;

  return createPortal(
    <div
      className="fixed top-10 left-1/2 border border-red-500 bg-red-100  
      p-4
      rounded-2xl
        flex flex-col items-center gap-2"
    >
      <TriangleAlert className="text-red-500 w-12 h-12" />
      <p className="text-red-500 text-lg">Error Creating Note!</p>
    </div>,
    document.body,
  );
}