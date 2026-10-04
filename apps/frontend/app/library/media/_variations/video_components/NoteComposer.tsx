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
import { isValidNoteTitle } from "@/lib/validation/note";

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
    if (isCreating) return;

    if (!isValidNoteTitle(writtenNote?.title)) {
      setErrToast(true);
      return;
    }

    try {
      const note: Note = {
        ...(writtenNote as Note),
        id: v4(),
        mediaId: mediaId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        timestamp: currTimestamp,
        entityType: EntityType.Note,
        expectedVersion: 1,
      };

      const noteAddStatus = await saveNoteToDbAndPushToQueue(note, device!.id);
      if (!noteAddStatus) {
        setErrToast(true);
        return;
      }
      onNoteAdd(note);
      onExitCloseComposer();
    } finally {
      setIsCreating(false);
    }
  };

  if (!showComposer) return;

  return (
    <div className="animate-fade-in border-b border-card-border bg-background-subtle/60 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-active">
            <PenBox className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-text-primary">Write a note</p>
            <p className="text-xs text-text-tertiary">Capture this moment</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card px-2.5 py-1.5 text-xs font-medium tabular-nums text-text-secondary shadow-sm">
          <ClockFading className="h-3.5 w-3.5 text-primary-active" aria-hidden="true" />
          <span>{textTimestamp}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="note-title" className="text-xs font-medium text-text-secondary">
            Title
          </label>
          <input
            id="note-title"
            maxLength={50}
            onChange={(e) => {
              setWrittenNote((prev) => ({ ...prev, title: e.target.value }));
            }}
            placeholder="Give this note a title"
            type="text"
            className="w-full min-w-0 rounded-xl border border-card-border bg-card px-3 py-2.5 text-sm text-text-primary shadow-sm outline-none placeholder:text-text-tertiary transition-colors hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="note-content" className="text-xs font-medium text-text-secondary">
            Note
          </label>
          <textarea
            id="note-content"
            maxLength={300}
            placeholder="Write your thoughts here..."
            onChange={(e) => {
              setWrittenNote((prev) => ({
                ...prev,
                content: e.target.value,
              }));
              setCurrContentLength(e.target.textLength);
            }}
            ref={inputRef}
            className="h-32 w-full min-w-0 resize-none rounded-xl border border-card-border bg-card px-3 py-2.5 text-sm leading-relaxed text-text-primary shadow-sm outline-none placeholder:text-text-tertiary transition-colors hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <p className="text-right text-xs tabular-nums text-text-tertiary">
            {currContentLength} / 300
          </p>
        </div>
      </div>

      <div className="mt-4 flex w-full gap-2">
        <button
          type="button"
          className="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-card-border bg-card px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-card-hover hover:text-text-primary"
          onClick={onExitCloseComposer}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Cancel
        </button>
        <button
          type="button"
          disabled={isCreating}
          onClick={createNote}
          className="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-emerald-950 shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PenBox className="h-4 w-4" aria-hidden="true" />
          Write note
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
      role="alert"
      className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-lg"
    >
      <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p>Could not create note.</p>
    </div>,
    document.body,
  );
}
