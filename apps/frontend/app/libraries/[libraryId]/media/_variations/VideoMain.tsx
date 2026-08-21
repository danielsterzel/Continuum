"use client";

import { useParams } from "next/navigation";
import { useMedia } from "@/app/context/MediaContext";
import { Edit } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import type { NoteRead } from "@/types/note";
import { getMediaColor, getMediaBg } from "../[mediaId]/page";
import {
  fetchMediaProgresForMedia,
  postMediaProgress,
} from "@/lib/api/media_progress";

import { NoteItem } from "./video_components/NoteItem";
import { CreateNote } from "./video_components/CreateNote";

const CRON_TIME = 30_000;

export function VideoMain() {
  const { libraryId, mediaId } = useParams<{
    libraryId: string;
    mediaId: string;
  }>();
  const { media } = useMedia();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(true);

  const handleNoteAdd = () => {



  };

  const initialProgressRef = useRef<number | null>(null);

  useEffect(() => {
    const mountMediaProgress = async () => {
      const savedProgress = await fetchMediaProgresForMedia({
        libraryId: libraryId,
        mediaId: mediaId,
      });

      initialProgressRef.current = savedProgress.currentPosition;

      if (
        savedProgress.currentPosition != null &&
        videoRef.current &&
        videoRef.current.readyState >= 1
      ) {
        videoRef.current.currentTime = savedProgress.currentPosition;
      }
    };

    mountMediaProgress();
    console.log("MOUNT from db");
  }, [libraryId, mediaId]);

  useEffect(() => {
    if (paused) {
      return;
    }
    const interval = setInterval(async () => {
      const currentPosition = videoRef.current?.currentTime ?? null;

      await postMediaProgress(
        {
          libraryId,
          mediaId,
        },
        {
          currentPosition,
          lastDeviceId: null,
        },
      );
    }, CRON_TIME);
    console.log("CRON");
    return () => clearInterval(interval);
  }, [libraryId, mediaId, paused]);

  if (!media) {
    return null;
  }
  const color = getMediaColor(media.mediaType);
  const bg = getMediaBg(media.mediaType);

  const noteMock: NoteRead = {
    id: "MOCK_ID",
    mediaId: media?.id,
    media: media,
    title: "This is a Note title",
    content:
      "This is some sort of text area and here I will have" +
      "the like... timestamp where the note is and the note description etc etc.",
    timestamp: 125,
    deleted_at: null,
    createdAt: 0,
    updatedAt: 0,
  };

  const saveProgress = async () => {
    const currentPosition = videoRef.current?.currentTime ?? null;

    await postMediaProgress(
      {
        libraryId,
        mediaId,
      },
      {
        currentPosition,
        lastDeviceId: null,
      },
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

  return (
    <div className="relative w-full flex flex-col items-center sm:block">
      <CreateNote videoRef={videoRef}/>
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
            className="w-full max-w-[240px] sm:max-w-[480px] max-h-[350px] sm:max-h-[560px] rounded-xl"
          >
            <source
              src={`${process.env.NEXT_PUBLIC_API_URL}/media_storage/${libraryId}/${mediaId}/${media?.filename}`}
              type="video/mp4"
            />
          </video>
        </div>
      </div>
    </div>
  );
}
