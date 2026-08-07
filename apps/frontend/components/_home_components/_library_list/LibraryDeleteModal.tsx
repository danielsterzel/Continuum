"use client";

import { deleteLibrary } from "@/lib/api/library";
import { TriangleAlert, Trash2, X, Library } from "lucide-react";
import { createPortal } from "react-dom";

type LibraryDeleteModalProps = {
  show: boolean;
  userId: string;
  libraryId: string;
  onClose: () => void;
  onDeleted: () => void;
};

export function LibraryDeleteModal({
  show,
  libraryId,
  onClose,
  onDeleted,
  userId="76d06599-1154-4c60-b39e-6b9f6bba2046"
}: Readonly<LibraryDeleteModalProps>) {
  async function handleDelete() {
    await deleteLibrary(userId, libraryId);
    onDeleted();
    onClose();
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
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-red-100 scale-150 opacity-40" />
            {/* Middle ring */}
            <div className="absolute inset-0 rounded-full bg-red-100 scale-125 opacity-60" />
            {/* Icon circle */}
            <div className="relative w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <TriangleAlert
                className="w-9 h-9 text-red-500"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-xl font-semibold text-text-primary mb-2 text-center">
            Delete Library?
          </h2>
          <p className="text-text-secondary text-sm text-center leading-relaxed">
            This action is permanent and cannot be undone. All media inside this
            library will be removed.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-card-border" />

        {/* Actions */}
        <div className="flex gap-3 p-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-card-border text-text-secondary text-sm font-medium bg-card hover:bg-card-hover transition-colors duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
          onClick={handleDelete}
          className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-medium transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
