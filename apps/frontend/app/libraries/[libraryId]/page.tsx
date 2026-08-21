"use client";

import { LibraryHero } from "@/components/_library_components/LibraryHero";
import { MediaList } from "@/components/_library_components/MediaList";
import type { LibraryRead } from "@/types/library";
import type {MediaRead } from "@/types/media";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchSingleLib } from "@/lib/api/library";
import { GoBackButton } from "@/app/UI/GoBackButton";
import { useLibrary } from "@/app/context/LibraryContext";


export default function LibraryPage() {

    const router = useRouter();
    const {libraryId} = useParams<{libraryId: string}>();
    const {setItems} = useLibrary();

    const [library, setLibrary] = useState<LibraryRead | null>(null);
    const [media, setMedia] = useState<MediaRead[]>([]);


    useEffect(() => {
        const handleFetch = async () => {
            const lib = await fetchSingleLib(libraryId);
            setLibrary(lib);
            setMedia(lib.media ?? []);
        }

        handleFetch();

    }, [libraryId])

    function touchUpdatedAt() {
        const now = new Date().toISOString();
        setLibrary(prev => prev ? { ...prev, updatedAt: now } : prev);
        setItems(prev => prev.map(item => item.id === libraryId ? { ...item, updatedAt: now } : item));
    }

    return (
        <div className="relative min-h-screen w-full px-4 py-6">
            <GoBackButton onBack={() => router.back()}/>

            {library && <LibraryHero library={library} mediaCount={media.length}
            onMediaUploaded={(uploaded) => {
                setMedia(prev => [...prev,...uploaded]);
                touchUpdatedAt();
            }}/>}

            <div className="mt-10">
                <MediaList
                    media={media}
                    onDeleted={(mediaId) => {
                        setMedia(prev => prev.filter(m => m.id !== mediaId));
                        touchUpdatedAt();
                    }}
                />
            </div>
        </div>
    );
}
