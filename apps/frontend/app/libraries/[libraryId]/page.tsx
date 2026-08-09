"use client";

import { SlideMenu } from "@/components/_home_components/SlideMenu";
import { LibraryHero } from "@/components/_library_components/LibraryHero";
import { MediaList } from "@/components/_library_components/MediaList";
import type { Library } from "@/types/library";
import type {MediaRead } from "@/types/media";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchSingleLib } from "@/lib/api/library";
import { useAuth } from "@/hooks/useAuth";
import { GoBackButton } from "@/app/UI/GoBackButton";


export default function LibraryPage() {

    const {user} = useAuth();
    const router = useRouter();
    const {libraryId} = useParams<{libraryId: string}>();

    const [library, setLibrary] = useState<Library | null>(null);
    const [media, setMedia] = useState<MediaRead[]>([]);


    useEffect(() => {
        const handleFetch = async () => {
            const lib = await fetchSingleLib(user.id, libraryId);
            setLibrary(lib);
            setMedia(lib.media ?? []);
        }

        handleFetch();

    }, [user.id, libraryId])


    return (
        <div className="relative min-h-screen w-full px-4 py-6">
            <SlideMenu />
            <GoBackButton onBack={() => router.back()}/>

            {library && <LibraryHero library={library} mediaCount={media.length} 
            onMediaUploaded={(uploaded) => setMedia(prev => [...prev,...uploaded])}/>}

            <div className="mt-10">
                <MediaList media={media} />
            </div>
        </div>
    );
}
