import type { MediaRead } from "@/types/media";
import { MediaListItem } from "./MediaListItem";
import { Inbox } from "lucide-react";

type MediaListProps = {
    media: MediaRead[];
    onDeleted: (mediaId: string) => void;
};

export function MediaList({ media, onDeleted }: Readonly<MediaListProps>) {
    return (
        <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <p className="text-xl sm:text-3xl text-emerald-900 mb-4">Media</p>

            <div className="bg-card rounded-xl shadow-xl overflow-hidden border border-card-border">
                <div
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_minmax(2.5rem,auto)] px-4 py-2.5
                        text-text-tertiary text-sm border-b border-card-border bg-background-subtle"
                >
                    <span className="pl-10">Name</span>
                    <span className="hidden sm:block">Type</span>
                    <span className="hidden sm:block">Size</span>
                    <span className="hidden sm:block">Duration</span>
                    <span className="hidden sm:block">Modified</span>
                </div>

                {media.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div>
                        {media.map((item, idx) => (
                            <MediaListItem key={item.id} media={item} idx={idx} onDeleted={onDeleted} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-tertiary">
            <Inbox className="w-12 h-12 opacity-30" strokeWidth={1.0} />
            <p className="text-sm">No media in this library yet</p>
        </div>
    );
}
