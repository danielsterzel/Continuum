"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ImageIcon } from "lucide-react";

import type { LibraryCreate } from "@/types/library";

type LibraryModalProps = {
  show: boolean;
  onClose: () => void;
};

export function LibraryModal({ show, onClose }: LibraryModalProps) {
  const [currImg, setCurrImg] = useState<File | null>(null);
  const [err, setErr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [library, setLibrary] = useState<LibraryCreate>({
    user_id: "76d06599-1154-4c60-b39e-6b9f6bba2046",
    name: "",
    description: "",
  });

  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!err) return;
    const timeoutId = window.setTimeout(() => setErr(false), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [err]);

  async function createLib(bodyArg: LibraryCreate) {
    const response = await fetch("http://localhost:8000/library/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyArg),
    });
    if (!response.ok) throw new Error(`Creating library failed: ${response.status}`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setErr(false);
      setIsSubmitting(true);
      await createLib(library);
      setLibrary((prev) => ({ ...prev, name: "", description: "" }));
      setCurrImg(null);
      onClose();
    } catch (error) {
      console.error(error);
      setErr(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!show) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto
          rounded-2xl bg-card border border-card-border
          p-6 shadow-2xl animate-fade-in-up"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
              Something went wrong while creating the library. Please try again.
            </div>
          )}

          <div>
            <span className="text-xs tracking-widest text-emerald-400 uppercase">New</span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary mt-0.5">
              Create a library
            </h1>
          </div>

          <button
            type="button"
            onClick={() => imgInputRef.current?.click()}
            className="flex h-40 w-full cursor-pointer items-center justify-center
              rounded-xl border-2 border-dashed border-card-border
              bg-background-subtle hover:border-primary hover:bg-primary-subtle/30
              transition-colors duration-200 sm:h-48 sm:w-56 sm:self-center"
          >
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setCurrImg(file);
              }}
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <ImageIcon size={28} className="text-primary" strokeWidth={1.5} />
              </div>
              {currImg ? (
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="max-w-40 truncate">{currImg.name}</span>
                </div>
              ) : (
                <span className="text-text-tertiary text-sm">Add cover image</span>
              )}
            </div>
          </button>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="library-name" className="text-sm font-medium text-text-secondary">
              Name
            </label>
            <input
              id="library-name"
              name="name"
              type="text"
              required
              minLength={1}
              maxLength={100}
              value={library.name}
              className="rounded-xl border border-card-border bg-background-subtle px-4 py-2.5
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-colors duration-200"
              placeholder="My Library"
              onChange={(e) =>
                setLibrary((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="library-description" className="text-sm font-medium text-text-secondary">
              Description
              <span className="ml-1 text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              id="library-description"
              name="description"
              rows={3}
              value={library.description ?? ""}
              className="resize-none rounded-xl border border-card-border bg-background-subtle px-4 py-2.5
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-colors duration-200"
              placeholder="A short description…"
              onChange={(e) =>
                setLibrary((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-stretch mt-1 rounded-xl
              bg-gradient-to-r from-emerald-400 to-emerald-500
              hover:from-emerald-500 hover:to-emerald-600
              px-5 py-2.5 font-medium text-white shadow-sm hover:shadow-md
              transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]
              cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating…" : "Create library"}
          </button>
        </form>
      </div>
    </div>
  );
}
