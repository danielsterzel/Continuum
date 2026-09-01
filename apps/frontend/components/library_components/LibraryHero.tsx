"use client";

import type { Library } from "@/lib/types/Library";
import { BookOpen, Calendar, FileStack } from "lucide-react";
import { formatDate } from "@/lib/Datetime";
import { MetaChip } from "./MetaChip";
import { PrimaryArrowButton } from "../buttons/PrimaryArrowButton";
import { MultipleHiddenInput } from "@/components/input/HiddenInput";
import { useEffect, useRef, useState } from "react";
import { RenderInputFiles } from "@/components/input/RenderInputFiles";
import { Media } from "@/lib/types/Media";
import { getFullFilepath } from "@/lib/files/LocalFileStorage";
import { createMedia } from "@/lib/db/services/media_service";
import { useDevice } from "@/app/context/DeviceContext";

type LibraryHeroProps = {
  library: Library;
  mediaCount?: number;
  onMediaUploaded: (uploaded: Media[]) => void;
};

export function LibraryHero({
  library,
  mediaCount = 0,
  onMediaUploaded,
}: Readonly<LibraryHeroProps>) {
  const [files, setFile] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [iconPath, setIconPath] = useState("");

  const {device} = useDevice();

  useEffect(() => {
    async function loadIcon() {
      if (!library.iconUrl) {
        setIconPath("");
        return;
      }

      const path = await getFullFilepath(library.iconUrl);

      console.log("FULL ICON PATH:", path);

      if (path) {
        setIconPath(path);
      }
    }

    loadIcon();
  }, [library.iconUrl]);

  return (
    <div className="animate-fade-in flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-center">
      <div
        className="shrink-0 w-36 h-36 sm:w-48 sm:h-48 rounded-2xl
        flex items-center justify-center shadow-lg overflow-hidden
        bg-gradient-to-br from-emerald-100 to-emerald-200"
      >
        {iconPath ? (
          <img
            src={iconPath}
            alt={library.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen
            className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-500"
            strokeWidth={1}
          />
        )}
      </div>

      <div className="animate-slide-in-left flex flex-col gap-3">
        <span className="text-xs tracking-widest text-emerald-400 uppercase">
          Library
        </span>
        <p className="text-red-500">ICON URL: {library.iconUrl}</p>

        <h1 className="text-3xl sm:text-5xl font-semibold text-text-primary leading-tight">
          {library.name}
        </h1>

        {library.description && (
          <p className="text-text-secondary max-w-lg">{library.description}</p>
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
        <PrimaryArrowButton
          onClick={() => fileInputRef.current?.click()}
          styling="rounded-full bg-primary 
                 text-emerald-950
                 w-32 items-center jusitfy-center p-1 "
        >
          Add Media
        </PrimaryArrowButton>
      </div>
      <div>
        <RenderInputFiles
          items={files}
          onDelete={(index) => {
            setFile((prev) => prev.filter((_, i) => i !== index));
          }}
          onSubmit={async () => {
            const uploaded = await Promise.all(
            files.map((file, _) => createMedia(file, library.id, device!.id)));

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
