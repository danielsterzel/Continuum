"use client";

import { SlideMenu } from "@/components/_home_components/SlideMenu";
import { LibraryHero } from "@/components/_library_components/LibraryHero";
import { MediaList } from "@/components/_library_components/MediaList";
import type { Library } from "@/types/library";
import type { Media, MediaRead } from "@/types/media";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchSingleLib } from "@/lib/api/library";
import { useAuth } from "@/hooks/useAuth";


export default function LibraryPage() {

    const {user} = useAuth();
    const router = useRouter();
    const params = useParams<{id: string}>();
    const libId = params.id;

    const [library, setLibrary] = useState<Library | null>(null);
    const [media, setMedia] = useState<MediaRead[]>([]);


    useEffect(() => {
        const handleFetch = async () => {
            const lib = await fetchSingleLib(user.id, libId);
            setLibrary(lib);
            setMedia(lib.media ?? []);
        }

        handleFetch();

    }, [user.id, libId])


    return (
        <div className="relative min-h-screen w-full px-4 py-6">
            <SlideMenu />

            <button
                onClick={() => router.back()}
                className="group flex items-center gap-2 mb-8
                    text-text-tertiary hover:text-text-primary
                    transition-colors duration-200"
            >
                <ArrowLeft
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
                />
                <span className="text-sm">Back</span>
            </button>

            {library && <LibraryHero library={library} mediaCount={media.length} 
            onMediaUploaded={(uploaded) => setMedia(prev => [...prev,...uploaded])}/>}

            <div className="mt-10">
                <MediaList media={media} />
            </div>
        </div>
    );
}
