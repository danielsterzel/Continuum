"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect} from "react";
import { fetchSingleMedia } from "@/lib/api/library";
import { GoBackButton } from "@/app/UI/GoBackButton";
import { getMediaIcon } from "@/components/_library_components/MediaListItem";
import { formatFileSize } from "@/lib/UxMedia";
import { VideoMain } from "./_variations/VideoMain";
import { ImageMain } from "./_variations/ImageMain";
import { PdfMain } from "./_variations/PdfMain";
import { AudioMain } from "./_variations/AudioMain";
import { MetaChip } from "@/components/_library_components/MetaChip";
import { formatDate } from "@/lib/datetime";
import { HardDrive, Tag, Calendar, CalendarClock } from "lucide-react";
import { useMedia } from "@/app/context/MediaContext";

function formatName(name: string) {
  return name.split(".")[0];
}

function getMediaMain(type: string)
{
    const t = type.toLowerCase();
    if(t.includes("video")) return VideoMain
    if(t.includes("pdf")) return PdfMain
    if(t.includes("audio")) return AudioMain
    if(t.includes("image")) return ImageMain

    return null;
}   

export function getMediaBg(type: string) {
  const t = type.toLocaleLowerCase();

  if (t.includes("video")) return "bg-emerald-500/20";
  if (t.includes("audio")) return "bg-blue-400/20";
  if (t.includes("image")) return "bg-purple-400/20";
  if (t.includes("pdf")) return "bg-orange-400/20";

  return "bg-card";
}

export function getMediaColor(type: string)
{
    const t = type.toLowerCase();
    if (t.includes("video")) return "text-emerald-500";
    if (t.includes("audio")) return "text-blue-400";
    if (t.includes("image")) return "text-purple-400";
    if (t.includes("pdf")) return "text-orange-400";

    return "text-text-tertiary";
}

type ImgStyle = {
  icon: React.ReactNode;
};

type Color = {
    bg: string;
    text: string;
}

type Pallete = {
    colors: Color;
    img: ImgStyle;
}

export function MediaClient()
{
  const searchParams = useSearchParams();

  const libraryId = searchParams.get("libraryId");
  const mediaId = searchParams.get("mediaId");

  if(!libraryId || !mediaId)
    {
        return null;
    }

  const {media, setMedia} = useMedia();
  console.log("RENDER MEDIA:", media);

  useEffect(() => {
    const fetchMedia = async () => {
      console.log("FETCH START", libraryId, mediaId);
      const mediaResponse = await fetchSingleMedia(libraryId, mediaId);
      console.log("FETCH RESPONSE:", mediaResponse);
      setMedia(mediaResponse);
    };
    fetchMedia();
  }, [libraryId, mediaId, setMedia]);

  const router = useRouter();

  if (!media) {
    return;
  }

  const getMediaPallete = () => {
    const mediaIcon =
      media.thumbnailUrl ??
      getMediaIcon(media.mediaType, "w-20 h-20 sm:w-24 sm:h-24");

    const bg = getMediaBg(media.mediaType);
    const color = getMediaColor(media.mediaType);

    const pallete: Pallete = {colors: {bg: bg, text: color}, img: {icon: mediaIcon}};
    return pallete
  };

  const pallete = getMediaPallete();
  const Main = getMediaMain(media.mediaType);

  return (
    <div className="min-h-screen w-full px-4 py-6">
      <GoBackButton onBack={() => router.back()} />
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center sm:items-start text-center sm:text-left">
        <div
          className={`w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 flex shrink-0 ${pallete.colors.bg} rounded-2xl shadow-lg items-center justify-center`}
        >
          {pallete.img.icon}
        </div>
        <div className="flex flex-col gap-2 items-center sm:items-start animate-slide-in-left">
        <p className={`${pallete.colors.text} text-xs tracking-widest uppercase`}>media</p>
          <h1 className="mt-2 sm:mt-6 text-2xl sm:text-3xl md:text-5xl font-bold tracking-wide break-all">{formatName(media.filename)}</h1>
            <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
              <MetaChip
                icon={<Tag className="w-3.5 h-3.5" />}
                label={media.mediaType}
              />
              <MetaChip
                icon={<HardDrive className="w-3.5 h-3.5" />}
                label={formatFileSize(media.fileSize)}
              />
              <MetaChip
                icon={<Calendar className="w-3.5 h-3.5" />}
                label={`Added ${formatDate(media.createdAt)}`}
              />
              <MetaChip
                icon={<CalendarClock className="w-3.5 h-3.5" />}
                label={`Updated ${formatDate(media.updatedAt)}`}
              />
            </div>
        </div>
      </div>
      <div className="mt-8 sm:mt-12 flex items-center justify-center">{Main && <Main />}</div>

    </div>
  );  
}