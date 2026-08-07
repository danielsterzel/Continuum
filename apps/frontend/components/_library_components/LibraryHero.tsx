import type { Library } from "@/types/library";
import { BookOpen, Calendar, FileStack } from "lucide-react";
import { formatDate } from "@/lib/datetime";
import { MetaChip } from "./MetaChip";

type LibraryHeroProps = {
    library: Library;
    mediaCount?: number;
};

export function LibraryHero({ library, mediaCount = 0 }: Readonly<LibraryHeroProps>) {
    return (
        <div className="animate-fade-in flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-center">
            <div
                className="shrink-0 w-36 h-36 sm:w-48 sm:h-48 rounded-2xl
                    flex items-center justify-center shadow-lg overflow-hidden
                    bg-gradient-to-br from-emerald-100 to-emerald-200"
            >
                {library.iconUrl ? (
                    <img
                        src={library.iconUrl}
                        alt={library.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <BookOpen
                        className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-500"
                        strokeWidth={1.0}
                    />
                )}
            </div>

            <div className="animate-slide-in-left flex flex-col gap-3">
                <span className="text-xs tracking-widest text-emerald-400 uppercase">
                    Library
                </span>

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
            </div>
        </div>
    );
}

