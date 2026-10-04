"use client";

import type { Library } from "@/lib/types/Library";
import {
  BookOpen,
  Calendar,
  Camera,
  Check,
  FileStack,
  ImagePlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/Datetime";
import { MetaChip } from "./MetaChip";
import { MultipleHiddenInput } from "@/components/input/HiddenInput";
import { useEffect, useRef, useState } from "react";
import { RenderInputFiles } from "@/components/input/RenderInputFiles";
import { Media } from "@/lib/types/Media";
import { getFullFilepath } from "@/lib/files/LocalFileStorage";
import { createMedia } from "@/lib/db/services/media_service";
import { updateLibrary } from "@/lib/db/services/library_service";
import type { LibraryUpdate } from "@/lib/db/services/library_service";
import { useDevice } from "@/app/context/DeviceContext";

type LibraryHeroProps = {
  library: Library;
  mediaCount?: number;
  onLibraryUpdated: (library: Library) => void;
  onMediaUploaded: (uploaded: Media[]) => void;
};

export function LibraryHero({
  library,
  mediaCount = 0,
  onLibraryUpdated,
  onMediaUploaded,
}: Readonly<LibraryHeroProps>) {
  const [files, setFile] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const coverMenuRef = useRef<HTMLDivElement | null>(null);
  const [iconPath, setIconPath] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(library.name);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [draftDescription, setDraftDescription] = useState(
    library.description ?? "",
  );
  const [coverMenuOpen, setCoverMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { device } = useDevice();

  useEffect(() => {
    async function loadIcon() {
      if (!library.iconUrl) {
        setIconPath("");
        return;
      }

      const path = await getFullFilepath(library.iconUrl);

      setIconPath(path ?? "");
    }

    loadIcon();
  }, [library.iconUrl]);

  useEffect(() => {
    return () => {
      if (iconPath.startsWith("blob:")) URL.revokeObjectURL(iconPath);
    };
  }, [iconPath]);

  useEffect(() => {
    if (!coverMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !coverMenuRef.current?.contains(target)) {
        setCoverMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCoverMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [coverMenuOpen]);

  const saveChanges = async (
    changes: LibraryUpdate,
  ): Promise<Library | null> => {
    if (!device) {
      setSaveError("The device is not ready yet. Please try again.");
      return null;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      const updatedLibrary = await updateLibrary(
        library.userId,
        library.id,
        device.id,
        changes,
      );
      if (!updatedLibrary) {
        throw new Error("Library not found");
      }
      onLibraryUpdated(updatedLibrary);
      return updatedLibrary;
    } catch (error) {
      console.error(error);
      setSaveError("The library could not be updated. Please try again.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const saveName = async () => {
    const nextName = draftName.trim();
    if (!nextName) return;
    const updatedLibrary = await saveChanges({ name: nextName });
    if (updatedLibrary) {
      setIsEditingName(false);
    }
  };

  const saveDescription = async () => {
    const updatedLibrary = await saveChanges({
      description: draftDescription,
    });
    if (updatedLibrary) setIsEditingDescription(false);
  };

  const saveIcon = async (icon: File | null) => {
    const updatedLibrary = await saveChanges({ icon });
    if (!updatedLibrary) return;

    if (!updatedLibrary.iconUrl) {
      setIconPath("");
      return;
    }

    const path = await getFullFilepath(updatedLibrary.iconUrl);
    setIconPath(path ?? "");
  };

  return (
    <div className="animate-fade-in flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-center">
      <div className="shrink-0">
        <div className="relative h-36 w-36 sm:h-48 sm:w-48">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-lg">
            {iconPath ? (
              // The source is a local Capacitor/blob URL, so Next Image optimization is unavailable.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconPath}
                alt={library.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen
                className="h-20 w-20 text-emerald-500 sm:h-24 sm:w-24"
                strokeWidth={1}
              />
            )}
          </div>
          {!coverMenuOpen && (
            <button
              type="button"
              aria-label="Edit library image"
              onClick={() => setCoverMenuOpen(true)}
              className="absolute bottom-2 right-2 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/70 bg-card/95 text-text-secondary shadow-md backdrop-blur-sm transition-colors hover:bg-card hover:text-primary-active focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {coverMenuOpen && (
            <div
              ref={coverMenuRef}
              className="absolute inset-x-1.5 top-1/2 z-20 -translate-y-1/2 overflow-hidden rounded-xl border border-card-border bg-card p-1 shadow-lg"
            >
              <button
                type="button"
                onClick={() => {
                  setCoverMenuOpen(false);
                  iconInputRef.current?.click();
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-text-primary transition-colors hover:bg-background-subtle sm:px-3 sm:text-sm"
              >
                <ImagePlus
                  className="h-4 w-4 text-primary-active"
                  aria-hidden="true"
                />
                Change image
              </button>
              {iconPath && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverMenuOpen(false);
                    void saveIcon(null);
                  }}
                  disabled={isSaving}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-danger transition-colors hover:bg-red-50 sm:px-3 sm:text-sm"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove image
                </button>
              )}
            </div>
          )}
        </div>
        <input
          ref={iconInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Choose library image"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void saveIcon(file);
            }
            event.target.value = "";
          }}
        />
      </div>

      <div className="animate-slide-in-left flex min-w-0 flex-col gap-3">
        <span className="text-xs tracking-widest text-emerald-400 uppercase">
          Library
        </span>

        {isEditingName ? (
          <div className="flex max-w-xl flex-col gap-2">
            <label htmlFor="library-title-edit" className="sr-only">
              Library name
            </label>
            <input
              id="library-title-edit"
              type="text"
              maxLength={100}
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveName();
                if (event.key === "Escape") setIsEditingName(false);
              }}
              className="w-full min-w-0 rounded-xl border border-primary bg-card px-3 py-1.5 text-3xl font-semibold leading-tight text-text-primary shadow-sm outline-none ring-2 ring-primary/15 sm:text-5xl"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void saveName()}
                disabled={!draftName.trim() || isSaving}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-emerald-950 transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-card-hover"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="min-w-0 break-words text-3xl font-semibold leading-tight text-text-primary sm:text-5xl">
              {library.name}
            </h1>
            <button
              type="button"
              aria-label="Edit library name"
              onClick={() => {
                setDraftName(library.name);
                setIsEditingName(true);
              }}
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-card-border bg-card text-text-tertiary shadow-sm transition-colors hover:border-primary/40 hover:bg-primary-subtle/40 hover:text-primary-active focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {isEditingDescription ? (
          <div className="flex w-full max-w-xl flex-col gap-2">
            <label htmlFor="library-description-edit" className="sr-only">
              Library description
            </label>
            <textarea
              id="library-description-edit"
              rows={3}
              autoFocus
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  void saveDescription();
                }
                if (event.key === "Escape") {
                  setDraftDescription(library.description ?? "");
                  setIsEditingDescription(false);
                }
              }}
              className="resize-y rounded-xl border border-primary bg-card px-3 py-2 text-text-secondary shadow-sm outline-none ring-2 ring-primary/15"
              placeholder="Add a short description…"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void saveDescription()}
                disabled={isSaving}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-emerald-950 transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftDescription(library.description ?? "");
                  setIsEditingDescription(false);
                }}
                disabled={isSaving}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-card-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex max-w-xl items-start gap-2">
            {library.description ? (
              <p className="whitespace-pre-wrap text-text-secondary">
                {library.description}
              </p>
            ) : (
              <p className="italic text-text-tertiary">No description</p>
            )}
            <button
              type="button"
              aria-label="Edit library description"
              onClick={() => {
                setDraftDescription(library.description ?? "");
                setIsEditingDescription(true);
              }}
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-card-border bg-card text-text-tertiary shadow-sm transition-colors hover:border-primary/40 hover:bg-primary-subtle/40 hover:text-primary-active focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {saveError && (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          <MetaChip
            icon={<FileStack className="w-3.5 h-3.5" />}
            label={`${mediaCount} ${mediaCount === 1 ? "file" : "files"}`}
          />
          <MetaChip
            icon={<Calendar className="w-3.5 h-3.5" />}
            label={`Updated ${formatDate(library.updatedAt)}`}
          />
        </div>
        {/* <PrimaryArrowButton
          onClick={() => fileInputRef.current?.click()}
          styling="rounded-full bg-primary 
                 text-emerald-950
                 font-medium
                 w-32 items-center jusitfy-center px-6 py-2 w-fit "
        >
          Add Media
        </PrimaryArrowButton> */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full bg-primary
          hover:scale-[1.02]
          cursor-pointer
          text-emerald-950
          font-medium
          w-32 items-center jusitfy-center px-6 py-2 w-fit "
        >
          Upload Media from device
        </button>
      </div>
      <div>
        <RenderInputFiles
          items={files}
          onDelete={(index) => {
            setFile((prev) => prev.filter((_, i) => i !== index));
          }}
          onSubmit={async () => {
            const uploaded = await Promise.all(
              files.map((file) => createMedia(file, library.id, device!.id)),
            );

            onMediaUploaded(uploaded);

            setFile([]);
          }}
        />
      </div>
      <MultipleHiddenInput
        styling=""
        onChange={(e) => {
          const newFiles = Array.from(e.target.files ?? []);
          setFile((prev) => [...prev, ...newFiles]);
        }}
        fileInputRef={fileInputRef}
      ></MultipleHiddenInput>
    </div>
  );
}
