"use client";

import { useSearchParams } from "next/navigation";
import { LibraryHero } from "@/components/_library_components/LibraryHero";
import { MediaList } from "@/components/_library_components/MediaList";
import type { Library, LibraryRead } from "@/types/library";
import type {MediaRead } from "@/types/media";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GoBackButton } from "@/app/UI/GoBackButton";
import { useLibrary } from "@/app/context/LibraryContext";
import { getDatabase } from "@/lib/db/database";
import { LibraryRepository } from "@/lib/db/repositories/library_repository";
import { useUser } from "../context/UserContext";
import { MediaRepository } from "@/lib/db/repositories/media_repository";

export function LibraryClient()
{
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const libraryId = searchParams.get("libraryId");

    if(!libraryId)
        {
            return null;
        }
        
    const {setItems} = useLibrary();

    const [library, setLibrary] = useState<Library | null>(null);
    const [media, setMedia] = useState<MediaRead[]>([]);
    const {user} = useUser();
    
        useEffect(() => {

        }, [user]);

        useEffect(() => {
            async function fetchLibraryAndMedia()
            {
                if(!user)
                {
                    router.replace("/login");
                    return;
                }

                const db = await getDatabase();
                const libraryRepository = new LibraryRepository(db);
                const mediaRepository = new MediaRepository(db);
                
                const lib = await libraryRepository.getByLibId(user.id, libraryId!);
                setLibrary(lib);

                if(lib)
                {
                    const media = await mediaRepository.getAllByLibraryId(user.id, lib.id);
                    setMedia(media);
                }
            }
            fetchLibraryAndMedia();
        }, [libraryId, user, router]);

    
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