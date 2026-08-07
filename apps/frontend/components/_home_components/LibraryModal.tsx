"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Image } from "lucide-react";

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
    if (!err) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setErr(false);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [err]);

  async function createLib(bodyArg: LibraryCreate) {
    const response = await fetch("http://localhost:8000/library/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyArg),
    });

    if (!response.ok) {
      throw new Error(`Creating library failed: ${response.status}`);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setErr(false);
      setIsSubmitting(true);

      await createLib(library);

      setLibrary((prev) => ({
        ...prev,
        name: "",
        description: "",
      }));

      setCurrImg(null);
      onClose();
    } catch (error) {
      console.error(error);
      setErr(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!show) {
    return null;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          max-h-[90vh]
          w-full
          max-w-4xl
          overflow-y-auto
          rounded-2xl
          bg-card
          p-4
          text-neutral-500
          shadow-xl
          sm:p-6
        "
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
          {err && (
            <div className="rounded-lg bg-red-100 p-4 text-red-600">
              Something went wrong while creating the library.
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl">Create a new library</h1>

          <button
            type="button"
            onClick={() => imgInputRef.current?.click()}
            className="
              flex
              h-40
              w-full
              cursor-pointer
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-neutral-500
              sm:h-56
              sm:w-64
              sm:self-center
            "
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

            <div className="flex flex-col items-center justify-center gap-4">
              <Image size={48} />

              {currImg && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="max-w-56 truncate">{currImg.name}</span>
                </div>
              )}
            </div>
          </button>

          <div className="flex flex-col gap-2">
            <label htmlFor="library-name">Name</label>

            <input
              id="library-name"
              name="name"
              type="text"
              required
              minLength={1}
              maxLength={100}
              value={library.name}
              className="rounded-md border border-neutral-500 px-3 py-2"
              onChange={(e) =>
                setLibrary((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="library-description">Description</label>

            <textarea
              id="library-description"
              name="description"
              rows={4}
              value={library.description ?? ""}
              className="resize-none rounded-md border border-neutral-500 px-3 py-2"
              onChange={(e) =>
                setLibrary((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
            self-center
              mt-2
              rounded-md
              bg-emerald-400
              px-4
              py-2
              w-fit
              cursor-pointer
              transition-colors
              activate:bg-primary-active
              hover:bg-primary-hover
              duration-200
              font-medium
              text-text-primary
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isSubmitting ? "Creating..." : "Create library"}
          </button>
        </form>
      </div>
    </div>
  );
}