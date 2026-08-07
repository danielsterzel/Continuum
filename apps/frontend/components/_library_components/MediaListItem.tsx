import type { Media } from "@/types/media";
import { Video, Music, Image, FileText, File } from "lucide-react";
import { formatDate } from "@/lib/datetime";

function getMediaIcon(type: string) {
    const t = type.toLowerCase();
    if (t.includes("video")) return <Video className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />;
    if (t.includes("audio")) return <Music className="w-5 h-5 text-blue-400" strokeWidth={1.5} />;
    if (t.includes("image")) return <Image className="w-5 h-5 text-purple-400" strokeWidth={1.5} />;
    if (t.includes("pdf") || t.includes("doc") || t.includes("text"))
        return <FileText className="w-5 h-5 text-orange-400" strokeWidth={1.5} />;
    return <File className="w-5 h-5 text-text-tertiary" strokeWidth={1.5} />;
}

type TypeBadge = { label: string; className: string };

function getTypeBadge(type: string): TypeBadge {
    const t = type.toLowerCase();
    if (t.includes("video")) return { label: "Video", className: "bg-emerald-100 text-emerald-700" };
    if (t.includes("audio")) return { label: "Audio", className: "bg-blue-100 text-blue-700" };
    if (t.includes("image")) return { label: "Image", className: "bg-purple-100 text-purple-700" };
    if (t.includes("pdf") || t.includes("doc") || t.includes("text"))
        return { label: "Doc", className: "bg-orange-100 text-orange-700" };
    return { label: type || "File", className: "bg-neutral-100 text-neutral-600" };
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDuration(seconds?: number): string {
    if (!seconds) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

type MediaListItemProps = {
    media: Media;
    idx: number;
};

export function MediaListItem({ media, idx }: Readonly<MediaListItemProps>) {
    const badge = getTypeBadge(media.type);

    return (
        <div
            className="animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.05}s` }}
        >
            <div
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-4 py-3
                    hover:bg-card-hover transition-colors duration-200 cursor-pointer"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        {getMediaIcon(media.type)}
                    </div>
                    <span className="text-text-primary truncate">{media.name}</span>
                </div>

                <div className="hidden sm:block">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge.className}`}>
                        {badge.label}
                    </span>
                </div>

                <span className="hidden sm:block text-text-secondary text-sm">
                    {formatFileSize(media.fileSize)}
                </span>

                <span className="hidden sm:block text-text-secondary text-sm">
                    {formatDuration(media.duration)}
                </span>

                <span className="hidden sm:block text-text-tertiary text-sm">
                    {formatDate(media.updatedAt)}
                </span>
            </div>

            <div className="h-px w-full bg-card-border" />
        </div>
    );
}
