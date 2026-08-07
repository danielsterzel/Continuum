"use client";

import { SlideMenu } from "@/components/_home_components/SlideMenu";
import { LibraryHero } from "@/components/_library_components/LibraryHero";
import { MediaList } from "@/components/_library_components/MediaList";
import type { Library } from "@/types/library";
import type { Media } from "@/types/media";
import { ArrowLeft } from "lucide-react";

// --- placeholder data — replace with actual fetch ---
const library: Library = {
    id: 1,
    name: "My Library",
    description: "A curated collection of media files.",
    iconUrl: "",
    updatedAt: new Date().toISOString(),
};

const media: Media[] = [];
// ----------------------------------------------------

export default function LibraryPage() {
    return (
        <div className="relative min-h-screen w-full px-4 py-6">
            <SlideMenu />

            <button
                onClick={() => window.history.back()}
                className="group flex items-center gap-2 mb-8
                    text-text-tertiary hover:text-text-primary
                    transition-colors duration-200"
            >
                <ArrowLeft
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
                />
                <span className="text-sm">Back</span>
            </button>

            <LibraryHero library={library} mediaCount={media.length} />

            <div className="mt-10">
                <MediaList media={media} />
            </div>
        </div>
    );
}
