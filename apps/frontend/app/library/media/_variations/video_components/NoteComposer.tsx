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
  onNoteAdd: (note: Note) => void;
  onExitCloseComposer: () => void;
  currTimestamp: number;
};
export function NoteComposer({
  currTimestamp,
  showComposer,
  onNoteAdd,
  onExitCloseComposer,
}: Readonly<NoteComposerProps>) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [writtenNote, setWrittenNote] = useState<Partial<Note>>();
  const [currContentLength, setCurrContentLength] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [errToast, setErrToast] = useState(false);

  const { device } = useDevice();

  const searchParams = useSearchParams();
  const mediaId = searchParams.get("mediaId");
  const textTimestamp = formatTimestamp(currTimestamp);


  if (!mediaId) {
    throw new Error("Media Id is missing from URL");
  }

  const createNote = async () => {

    if(isCreating) return;

    try
    {
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
    onNoteAdd(note);
    onExitCloseComposer();
  } finally {setIsCreating(false)}
  };

  if (!showComposer) return;

  return (
    <div className="animate-fade-in-up mx-0 flex w-full flex-col gap-3 rounded-t-3xl border-t border-card-border bg-card p-4 shadow-[0_-12px_30px_-24px_rgba(23,23,23,0.35)] sm:m-2 sm:w-auto sm:gap-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:animate-none">
      <div
        aria-hidden="true"
        className="mx-auto mb-1 h-1 w-12 rounded-full bg-card-border sm:hidden"
      />
      <div className="w-full flex flex-col gap-2 items-center justify-center">

        <div
          className="
          flex w-fit max-w-full items-center gap-2
          text-sm bg-card 
          border border-card-border 
          shadow-sm p-2
                text-text-tertiary
                rounded-2xl "
        >
                  <div className="bg-primary-subtle rounded-2xl p-2">
          <ClockFading className="w-6 h-6 text-primary" />
        </div>
        <p>
          Current Timestamp   {textTimestamp}
        </p>
        </div>
        <input
          maxLength={50}
          onChange={(e) => {
            setWrittenNote((prev) => ({ ...prev, title: e.target.value }));
          }}
          placeholder="My awesome title"
          type="text"
          className="
            w-full px-2 py-2 text-left sm:w-84
            text-2xl font-medium text-text-secondary
            border-b border-card-border outline-none
            transition-colors focus:border-primary"
        />
      </div>

      <div className="mt-2 flex w-full items-center justify-center bg-card sm:mt-4">
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
          className="h-36 w-full resize-none border p-2 sm:h-32 sm:w-84
            border-card-border
            rounded-2xl
            focus-none
            outline-none
            "
        />
      </div>
      <div className="text-text-tertiary">{currContentLength} / 300</div>

      <div className="flex w-full justify-between gap-2">
        <button
          className="cursor-pointer
            flex flex-1 items-center justify-center sm:w-32 sm:flex-none
            bg-red-200 text-danger rounded-full
            "
          onClick={onExitCloseComposer}
        >
          <X className="w-6 h-6" />
          Cancel
        </button>
        <button
        disabled={isCreating}
          onClick={createNote}
          className="
            flex-1 sm:w-32 sm:flex-none
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
