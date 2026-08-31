"use client";

import { deleteMediaFromLibrary } from "@/lib/api/library";
import { TriangleAlert, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useState } from "react";

type MediaDeleteModalProps = {
  show: boolean;
  libraryId: string;
  mediaId: string;
  filename: string;
  onClose: () => void;
  onDeleted: () => void;
};

export function MediaDeleteModal({
  show,
  libraryId,
  mediaId,
  filename,
  onClose,
  onDeleted,
}: Readonly<MediaDeleteModalProps>) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteMediaFromLibrary(libraryId, mediaId);
      onDeleted();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  if (!show) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-card-border animate-fade-in-up"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-card-hover transition-colors duration-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon area */}
        <div className="flex flex-col items-center pt-10 pb-6 px-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-red-100 scale-150 opacity-40" />
            <div className="absolute inset-0 rounded-full bg-red-100 scale-125 opacity-60" />
            <div className="relative w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <TriangleAlert
                className="w-9 h-9 text-red-500"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-xl font-semibold text-text-primary mb-2 text-center">
            Delete this file?
          </h2>
          <p className="text-text-secondary text-sm text-center leading-relaxed">
            <span className="font-medium text-text-primary">{filename}</span>{" "}
            will be permanently removed from storage. This cannot be undone —
            you&apos;ll need to upload it again if you change your mind.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-card-border" />

        {/* Actions */}
        <div className="flex gap-3 p-5">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-card-border text-text-secondary text-sm font-medium bg-card hover:bg-card-hover transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-medium transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
