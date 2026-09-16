"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMedia } from "@/app/context/MediaContext";
import { useState, useRef, useEffect } from "react";

import type { Note } from "@/lib/types/Note";
import { getMediaColor, getMediaBg } from "../MediaClient";

import { formatTimestamp, NoteItem } from "./video_components/NoteItem";
import { EntityType } from "@/lib/types/EntityType";
import {
  getVideoProgress,
  updateMediaProgress,
} from "@/lib/db/services/media_progress";
import { useUser } from "@/app/context/UserContext";
import { useDevice } from "@/app/context/DeviceContext";
import { getFullFile, getFullFilepath } from "@/lib/files/LocalFileStorage";
import { NotePanel } from "./video_components/NotePanel";

const CRON_TIME = 30_000;

export function VideoMain() {
  const [paused, setPaused] = useState(true);
  const [openNoteComposer, setOpenNoteComposer] = useState(false);
  const searchParams = useSearchParams();

  const libraryId = searchParams.get("libraryId");
  const mediaId = searchParams.get("mediaId");
  const { media } = useMedia();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { user } = useUser();
  const { device } = useDevice();
  const router = useRouter();
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const mediaFilepath = media?.filepath ?? null;
  const mediaFilename = media?.filename ?? null;

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (!device) {
      router.replace("/setup_device");
      return;
    }
  }, [user, device, router]);

  useEffect(() => {
    let legacyObjectUrl: string | null = null;
    let cancelled = false;

    const loadVideoSource = async () => {
      if (!mediaFilepath || !mediaFilename) {
        return;
      }

      let source: string;

      if (hasFileExtension(mediaFilepath)) {
        source = (await getFullFilepath(mediaFilepath)) ?? "";
      } else {
        const blob = await getFullFile(mediaFilepath);
        if (!blob) return;

        const typedBlob = new Blob([blob], {
          type: getVideoMimeType(mediaFilename),
        });
        legacyObjectUrl = URL.createObjectURL(typedBlob);
        source = legacyObjectUrl;
      }

      if (cancelled) {
        if (legacyObjectUrl) {
          URL.revokeObjectURL(legacyObjectUrl);
        }
        return;
      }

      setVideoSource(source);
    };

    loadVideoSource();

    return () => {
      cancelled = true;
      if (legacyObjectUrl) {
        URL.revokeObjectURL(legacyObjectUrl);
      }
    };
  }, [mediaFilepath, mediaFilename]);

  // TODO
  const writeNote = () => {

  };
  const initialProgressRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user || !device || !libraryId || !mediaId) return;
    const mountMediaProgress = async () => {
      const currVideoProgress = await getVideoProgress(
        user!.id,
        libraryId,
        mediaId,
        device!.id,
      );

      initialProgressRef.current = currVideoProgress.currentPosition;

      if (
        currVideoProgress.currentPosition != null &&
        videoRef.current &&
        videoRef.current.readyState >= 1
      ) {
        videoRef.current.currentTime = currVideoProgress.currentPosition;
      }
    };

    mountMediaProgress();
    console.log("MOUNT from db");
  }, [libraryId, mediaId, user, device]);

  useEffect(() => {
    if (!user || !device || !libraryId || !mediaId) return;
    if (paused) {
      return;
    }
    const interval = setInterval(async () => {
      const currentPosition = videoRef.current?.currentTime ?? null;

      await updateMediaProgress(
        user!.id,
        libraryId,
        mediaId,
        device!.id,
        currentPosition,
      );
    }, CRON_TIME);
    console.log("CRON");
    return () => clearInterval(interval);
  }, [libraryId, mediaId, paused, device, user]);

  if (!libraryId || !mediaId || !media) {
    return null;
  }
  const color = getMediaColor(media.mediaType);
  const bg = getMediaBg(media.mediaType);

  const noteMock: Note = {
    id: "MOCK_ID",
    mediaId: media.id,
    title: "This is a Note title",
    content:
      "This is some sort of text area and here I will have" +
      "the like... timestamp where the note is and the note description etc etc.",
    timestamp: 125,
    createdAt: new Date().toISOString(),
    updatedAt: "",
    entityType: EntityType.Note,
    version: 1,
    deletedAt: null,
  };

  const saveProgress = async () => {
    if (!user || !device) return;

    const currentPosition = videoRef.current?.currentTime ?? null;
    await updateMediaProgress(
      user.id,
      libraryId,
      mediaId,
      device.id,
      currentPosition,
    );
  };

  const handleSeek = async () => {
    await saveProgress();
    console.log("SEEK");
  };

  const handlePause = async () => {
    await saveProgress();
    console.log("PAUSE");
  };

  const currentTimestamp = videoRef.current?.currentTime ?? 0;

  return (
    <div className="relative w-full flex flex-col items-center sm:block">
      <div className="relative w-full flex flex-col sm:grid sm:grid-cols-4 sm:items-start gap-6">


        <NotePanel 
        currTimestamp={currentTimestamp}
        openNoteCreation={() => setOpenNoteComposer(true)} 
        showComposer={openNoteComposer}
        iconColor={color}
        iconBg={bg}
        onExitCloseComposer={() => setOpenNoteComposer(false)}/>

        <div
          className="
        order-1 sm:order-2
        bg-black
        rounded-2xl
        sm:col-span-3 sm:sticky sm:top-24 sm:self-start min-h-0 sm:min-h-[70vh] w-full flex items-center justify-center"
        >
          {videoSource && (
            <video
              onLoadedMetadata={(tag) => {
                if (initialProgressRef.current != null) {
                  tag.currentTarget.currentTime = initialProgressRef.current;
                }
              }}
              onSeeked={handleSeek}
              onPause={() => {
                handlePause();
                setPaused(true);
              }}
              onPlay={() => setPaused(false)}
              ref={videoRef}
              controls
              src={videoSource}
              className="w-full max-w-[240px] sm:max-w-[480px] max-h-[350px] sm:max-h-[560px] rounded-xl"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function hasFileExtension(filepath: string): boolean {
  const filename = filepath.split("/").at(-1) ?? "";
  return /\.[a-zA-Z0-9]+$/.test(filename);
}

function getVideoMimeType(filename: string): string {
  const extension = filename.split(".").at(-1)?.toLowerCase();

  if (extension === "mov" || extension === "qt") {
    return "video/quicktime";
  }

  if (extension === "webm") {
    return "video/webm";
  }

  return "video/mp4";
}
