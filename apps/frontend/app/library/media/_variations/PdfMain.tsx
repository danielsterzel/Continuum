"use client";

import { useMedia } from "@/app/context/MediaContext";
import { getFullFilepath } from "@/lib/files/LocalFileStorage";
import { useEffect, useState } from "react";

export function PdfMain() {
  const [pdfUrl, setPdfUrl] = useState<string>();
  const { media } = useMedia();

  useEffect(() => {
    if (!media) return;

    const loadPdf = async () => {
      const url = await getFullFilepath(media.filepath);
      setPdfUrl(url ?? undefined);
    };

    loadPdf();
  }, [media]);

  if (!media || !pdfUrl) return null;

  return (
    <iframe
      title={media.filename}
      src={pdfUrl}
      className="h-[100vh] w-full rounded-2xl border-0"
    />
  );
}
