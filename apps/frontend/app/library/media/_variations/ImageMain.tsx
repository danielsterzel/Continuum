"use client";

import { useMedia } from "@/app/context/MediaContext";
import { getFullFilepath } from "@/lib/files/LocalFileStorage";
import { useEffect, useState } from "react";
import { NotePanel } from "./video_components/NotePanel";

export function ImageMain() {

  const [imageUrl, setImageUrl] = useState<string>();
  const { media } = useMedia();

  useEffect(() => {
    if (!media) return;

    const loadPdf = async () => {
      const url = await getFullFilepath(media.filepath);
      setImageUrl(url ?? undefined);
    };

    loadPdf();
  }, [media]);

  if (!media || !imageUrl) return null;

  return (
    <div>
    <img src={imageUrl} alt="ERROR"/>
    </div>
  );
}