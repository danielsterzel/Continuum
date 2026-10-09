"use client";

// import { RecentlyUsedList } from "@/components/home_components/_recently_used/RecentlyUsedList";
import { HomeTitle } from "@/components/home_components/title_shelf/HomeTitle";
import { useState, useEffect } from "react";
import { LibraryModal } from "@/components/home_components/LibraryModal";
import { useLibrary } from "@/app/context/LibraryContext";
import { DeviceIcon } from "@/components/DeviceIcon";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { useDevice } from "../context/DeviceContext";
import { getLibraries } from "@/lib/db/services/library_service";
import Link from "next/link";
import {
  ContinueWatchingSection,
  DashboardOverview,
  LibrarySection,
  MediaMixSection,
  NoteSection,
  TopRatedSection,
} from "./DashboardComponents";
import {
  getDashboardSnapshot,
  getTopRatedMedia,
} from "@/lib/db/services/dashboard_service";
import type { DashboardSnapshot } from "@/lib/db/services/dashboard_service";
import { Database } from "lucide-react";
import {
  getLastWatchedVideo,
  type LastWatchedVideo,
} from "@/lib/db/services/last_watched_service";
import { getFullFilepath } from "@/lib/files/LocalFileStorage";
import { updateMediaRating } from "@/lib/db/services/media_service";

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  totalFiles: 0,
  totalBytes: 0,
  noteCount: 0,
  recentNotes: [],
  mediaTypes: [],
  topRatedMedia: [],
};

export default function Home() {
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const { items, setItems } = useLibrary();
  const { user } = useUser();
  const { device } = useDevice();
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [lastWatched, setLastWatched] = useState<LastWatchedVideo | null>(null);
  const [lastWatchedSource, setLastWatchedSource] = useState<string | null>(
    null,
  );
  const [isLastWatchedLoading, setIsLastWatchedLoading] = useState(true);
  const [isLastWatchedRatingSaving, setIsLastWatchedRatingSaving] =
    useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!device) {
      router.replace("/setup_device");
      return;
    }
    if (items.length > 0) {
      return;
    }
    async function getLibs(userId: string) {
      setItems(await getLibraries(userId));
    }
    getLibs(user.id);
  }, [device, items.length, router, setItems, user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    getDashboardSnapshot(user.id)
      .then((data) => {
        if (!cancelled) setSnapshot(data);
      })
      .catch((error) => {
        console.error("Could not load dashboard data", error);
      })
      .finally(() => {
        if (!cancelled) setIsDashboardLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items.length, user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    const loadLastWatchedVideo = async () => {
      setIsLastWatchedLoading(true);

      try {
        const video = await getLastWatchedVideo(user.id);
        if (cancelled) return;

        setLastWatched(video);
        setLastWatchedSource(null);

        if (!video) return;

        const source = (await getFullFilepath(video.media.filepath)) ?? null;
        if (source?.startsWith("blob:")) objectUrl = source;

        if (cancelled) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          return;
        }

        setLastWatchedSource(source);
      } catch (error) {
        console.error("Could not load the last watched video", error);
        if (!cancelled) {
          setLastWatched(null);
          setLastWatchedSource(null);
        }
      } finally {
        if (!cancelled) setIsLastWatchedLoading(false);
      }
    };

    void loadLastWatchedVideo();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user]);

  const handleLastWatchedRatingChange = async (rating: number) => {
    if (!user || !device || !lastWatched || isLastWatchedRatingSaving) return;

    const previousVideo = lastWatched;
    setLastWatched({
      ...lastWatched,
      media: { ...lastWatched.media, rating },
    });
    setIsLastWatchedRatingSaving(true);

    try {
      const updatedMedia = await updateMediaRating(
        user.id,
        lastWatched.media.libraryId,
        lastWatched.media.id,
        device.id,
        rating,
      );

      setLastWatched((currentVideo) =>
        currentVideo?.media.id === updatedMedia.id
          ? { ...currentVideo, media: updatedMedia }
          : currentVideo,
      );

      try {
        const topRatedMedia = await getTopRatedMedia(user.id);
        setSnapshot((current) => ({ ...current, topRatedMedia }));
      } catch (refreshError) {
        console.error("Could not refresh top-rated media", refreshError);
      }
    } catch (error) {
      console.error("Could not update the last watched video rating", error);
      setLastWatched((currentVideo) =>
        currentVideo?.media.id === previousVideo.media.id
          ? previousVideo
          : currentVideo,
      );
    } finally {
      setIsLastWatchedRatingSaving(false);
    }
  };

  return (
    <>
      <main className="relative min-h-screen w-full overflow-x-hidden bg-background px-4 py-6 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-96 h-96 w-96 rounded-full bg-primary-subtle/60 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[96rem] xl:grid xl:grid-cols-[18rem_minmax(0,72rem)] xl:items-start xl:gap-8">
          <div aria-label="Dashboard insights" className="hidden xl:block">
            <div className="sticky top-8 space-y-6">
              <NoteSection
                notes={snapshot.recentNotes}
                loading={isDashboardLoading}
                compact
              />
              <TopRatedSection
                media={snapshot.topRatedMedia}
                loading={isDashboardLoading}
              />
              <MediaMixSection
                mediaTypes={snapshot.mediaTypes}
                totalFiles={snapshot.totalFiles}
                loading={isDashboardLoading}
              />
            </div>
          </div>

          <div className="min-w-0">
            <header className="animate-fade-in flex flex-col justify-between gap-6 rounded-3xl border border-card-border bg-card p-6 shadow-sm sm:p-8 md:flex-row md:items-center">
              <HomeTitle displayName={user?.displayName} />
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                <DeviceIcon device={device} />
                {process.env.NODE_ENV === "development" && (
                  <Link
                    href="/db_debug"
                    className="inline-flex items-center justify-end gap-1.5 text-xs text-text-tertiary transition-colors hover:text-primary-active"
                  >
                    <Database className="h-3.5 w-3.5" />
                    Database inspector
                  </Link>
                )}
              </div>
            </header>

            <DashboardOverview
              libraryCount={items.length}
              snapshot={snapshot}
              loading={isDashboardLoading}
            />

            <ContinueWatchingSection
              item={lastWatched}
              videoSource={lastWatchedSource}
              loading={isLastWatchedLoading}
              ratingSaving={isLastWatchedRatingSaving}
              onRatingChange={handleLastWatchedRatingChange}
            />

            <LibrarySection
              showLibraryModal={() => setShowLibraryModal(true)}
            />

            <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.75fr)] xl:hidden">
              <NoteSection
                notes={snapshot.recentNotes}
                loading={isDashboardLoading}
              />
              <div className="space-y-8 xl:hidden">
                <MediaMixSection
                  mediaTypes={snapshot.mediaTypes}
                  totalFiles={snapshot.totalFiles}
                  loading={isDashboardLoading}
                />
                <TopRatedSection
                  media={snapshot.topRatedMedia}
                  loading={isDashboardLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <LibraryModal
        show={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
      />
    </>
  );
}
