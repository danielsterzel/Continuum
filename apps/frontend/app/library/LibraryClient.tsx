"use client";

import { useSearchParams } from "next/navigation";
import { LibraryHero } from "@/components/library_components/LibraryHero";
import { MediaList } from "@/components/library_components/MediaList";
import type { Library } from "@/lib/types/Library";
import type { Media } from "@/lib/types/Media";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoBackButton } from "@/components/buttons/GoBackButton";
import { useLibrary } from "@/app/context/LibraryContext";
import { useUser } from "../context/UserContext";
import { getLibrary } from "@/lib/db/services/library_service";
import { getAllMediaForLibrary } from "@/lib/db/services/media_service";

export function LibraryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const libraryId = searchParams.get("libraryId");

  if (!libraryId) {
    return null;
  }

  const { setItems } = useLibrary();

  const [library, setLibrary] = useState<Library | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const { user } = useUser();

  useEffect(() => {}, [user]);

  useEffect(() => {
    async function fetchLibraryAndMedia() {
      if (!user) {
        router.replace("/login");
        return;
      }

      const lib = await getLibrary(user.id, libraryId!);
      setLibrary(lib);

      if (lib) {
        const media = await getAllMediaForLibrary(user.id, lib.id);
        setMedia(media);
      }
    }
    fetchLibraryAndMedia();
  }, [libraryId, user, router]);

  function touchUpdatedAt() {
    const now = new Date().toISOString();

    setLibrary((prev) => (prev ? { ...prev, updatedAt: now } : prev));

    setItems((prev) =>
      prev.map((item) =>
        item.id === libraryId ? { ...item, updatedAt: now } : item,
      ),
    );
  }

  return (
    <div className="relative min-h-screen w-full px-4 py-6">
      <GoBackButton onBack={() => router.back()} />

      {library && (
        <LibraryHero
          library={library}
          mediaCount={media.length}
          onMediaUploaded={(uploaded) => {
            setMedia((prev) => [...prev, ...uploaded]);
            touchUpdatedAt();
          }}
        />
      )}

      <div className="mt-10">
        <MediaList
          media={media}
          onDeleted={(mediaId) => {
            setMedia((prev) => prev.filter((m) => m.id !== mediaId));
            touchUpdatedAt();
          }}
        />
      </div>
    </div>
  );
}
