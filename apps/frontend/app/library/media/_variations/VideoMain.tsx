"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMedia } from "@/app/context/MediaContext";
import { Edit } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import type { Note } from "@/lib/types/Note";
import { getMediaColor, getMediaBg } from "../MediaClient";

import { NoteItem } from "./video_components/NoteItem";
import { CreateNote } from "./video_components/CreateNote";
import { EntityType } from "@/lib/types/EntityType";
import {
  getVideoProgress,
  updateMediaProgress,
} from "@/lib/db/services/media_progress";
import { useUser } from "@/app/context/UserContext";
import { useDevice } from "@/app/context/DeviceContext";
import { getFullFilepath } from "@/lib/files/LocalFileStorage";

const CRON_TIME = 30_000;

export function VideoMain() {
  const searchParams = useSearchParams();

  const libraryId = searchParams.get("libraryId");
  const mediaId = searchParams.get("mediaId");

  if (!libraryId || !mediaId) {
    return null;
  }

  const { media } = useMedia();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(true);

  const { user } = useUser();
  const { device } = useDevice();
  const router = useRouter();
  const [videoSource, setVideoSource] = useState<string | null>(null);

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
    const loadVideoSource = async () => {
      const source = (await getFullFilepath(media!.filepath)) ?? "";
      setVideoSource(source);
    };

    loadVideoSource();
  }, [media!.filepath]);

  // TODO
  const handleNoteAdd = () => {};
  const initialProgressRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user || !device) return;
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
    if (!user || !device) return;
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

  if (!media) {
    return null;
  }
  const color = getMediaColor(media.mediaType);
  const bg = getMediaBg(media.mediaType);

  const noteMock: Note = {
    id: "MOCK_ID",
    mediaId: media?.id,
    media: media,
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
    const currentPosition = videoRef.current?.currentTime ?? null;
    await updateMediaProgress(
      user!.id,
      libraryId,
      mediaId,
      device!.id,
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

  console.log("Media Filepath: ", media.filepath);
  console.log("VIDEO SOURCE", videoSource);

  return (
    <div className="relative w-full flex flex-col items-center sm:block">
      <CreateNote videoRef={videoRef} />
      <div className="relative w-full flex flex-col sm:grid sm:grid-cols-4 sm:items-start gap-6">
        <ul className="order-2 sm:order-1 sm:col-span-1 w-full flex flex-col gap-3 items-center">
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
          <NoteItem note={noteMock} iconColor={color} iconBg={bg} />
        </ul>

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
