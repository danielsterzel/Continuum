"use client";
import type { MediaRead } from "@/types/media";
import { Video, Music, Image, FileText, File, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/datetime";
import { formatDuration, formatFileSize } from "@/lib/UxMedia";
import Link from "next/link"
import { useState } from "react";
import { MediaDeleteModal } from "./MediaDeleteModal";

export function getMediaIcon(type: string, styling?: string, strokeWidth: number = 1.5) {
  const t = type.toLowerCase();
  if (t.includes("video"))
    return <Video className={`${styling ?? "w-5 h-5"} text-emerald-500`} strokeWidth={strokeWidth} />;
  if (t.includes("audio"))
    return <Music className={`${styling ?? "w-5 h-5"} text-blue-400`} strokeWidth={strokeWidth} />;
  if (t.includes("image"))
    return <Image className={`${styling ?? "w-5 h-5"} text-purple-400`} strokeWidth={strokeWidth} />;
  if (t.includes("pdf") || t.includes("doc") || t.includes("text"))
    return <FileText className={`${styling ?? "w-5 h-5"} text-orange-400`} strokeWidth={strokeWidth} />;
  return <File className={`${styling ?? "w-5 h-5"} text-text-tertiary`} strokeWidth={strokeWidth} />;
}

type TypeBadge = { label: string; className: string };

export function getTypeBadge(type: string): TypeBadge {
  const t = type.toLowerCase();
  if (t.includes("video"))
    return { label: "Video", className: "bg-emerald-100 text-emerald-700" };
  if (t.includes("audio"))
    return { label: "Audio", className: "bg-blue-100 text-blue-700" };
  if (t.includes("image"))
    return { label: "Image", className: "bg-purple-100 text-purple-700" };
  if (t.includes("pdf") || t.includes("doc") || t.includes("text"))
    return { label: "Document", className: "bg-orange-100 text-orange-700" };
  return {
    label: type || "File",
    className: "bg-neutral-100 text-neutral-600",
  };
}

type MediaListItemProps = {
  media: MediaRead;
  idx: number;
  onDeleted: (mediaId: string) => void;
};

export function MediaListItem({ media, idx, onDeleted }: Readonly<MediaListItemProps>) {
  const badge = getTypeBadge(media.mediaType);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${idx * 0.05}s` }}
    ><Link href={`/libraries/${media.libraryId}/media/${media.id}`}>
      <div
        className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_minmax(2.5rem,auto)] items-center px-4 py-3
                    hover:bg-card-hover transition-colors duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            {getMediaIcon(media.mediaType)}
          </div>
          <span className="text-text-primary truncate">{media.filename}</span>
        </div>

        <div className="hidden sm:block">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        <span className="hidden sm:block text-text-secondary text-sm">
          {formatFileSize(media.fileSize)}
        </span>

        <span className="hidden sm:block text-text-secondary text-sm">
          {media.duration ? formatDuration(media.duration) : ""}
        </span>

        <span className="hidden sm:block text-text-tertiary text-sm">
          {formatDate(media.updatedAt)}
        </span>
        <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowDeleteModal(true);
        }}
        className="
        cursor-pointer
        bg-red-200 max-w-6 max-h-6 sm:max-w-8 sm:max-h-8 rounded-lg p-1 justify-self-end">
        <Trash2 className="w-4 h-4 sm:w-6 sm:h-6 text-red-500"/>
      </button>
      </div>
      </Link>

      <div className="h-px w-full bg-card-border" />

      <MediaDeleteModal
        show={showDeleteModal}
        libraryId={media.libraryId}
        mediaId={media.id}
        filename={media.filename}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={() => onDeleted(media.id)}
      />
    </div>
  );
}
