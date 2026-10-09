"use client";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { LibraryList } from "@/components/home_components/_library_list/LibraryList";
import { formatDate } from "@/lib/Datetime";
import { formatDuration, formatFileSize } from "@/lib/UxMedia";
import type {
  DashboardNote,
  DashboardSnapshot,
  MediaTypeCount,
  TopRatedMedia,
} from "@/lib/db/services/dashboard_service";
import type { LastWatchedVideo } from "@/lib/db/services/last_watched_service";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Clock3,
  FileImage,
  Files,
  FileText,
  Film,
  FolderOpen,
  HardDrive,
  LibraryBig,
  LucideIcon,
  Music2,
  Notebook,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  StickyNote,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { RatingStars } from "@/components/RatingStars";

type LibraryPanelProps = {
  showLibraryModal: () => void;
};

export function DashboardOverview({
  libraryCount,
  snapshot,
  loading,
}: Readonly<{
  libraryCount: number;
  snapshot: DashboardSnapshot;
  loading: boolean;
}>) {
  const stats = [
    {
      label: "Libraries",
      value: String(libraryCount),
      detail: libraryCount === 1 ? "focused collection" : "focused collections",
      icon: LibraryBig,
      tone: "emerald" as const,
    },
    {
      label: "Media files",
      value: String(snapshot.totalFiles),
      detail: "ready when you are",
      icon: Files,
      tone: "blue" as const,
    },
    {
      label: "Notes",
      value: String(snapshot.noteCount),
      detail: "ideas worth keeping",
      icon: StickyNote,
      tone: "amber" as const,
    },
    {
      label: "Local storage",
      value: formatFileSize(snapshot.totalBytes),
      detail: "across your libraries",
      icon: HardDrive,
      tone: "violet" as const,
    },
  ];

  return (
    <section
      aria-label="Workspace overview"
      className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          {...stat}
          loading={loading && index > 0}
          delay={`${0.08 + index * 0.06}s`}
        />
      ))}
    </section>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  loading,
  delay,
}: Readonly<{
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "emerald" | "blue" | "amber" | "violet";
  loading: boolean;
  delay: string;
}>) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-600 ring-emerald-200/80",
    blue: "bg-sky-100 text-sky-600 ring-sky-200/80",
    amber: "bg-amber-100 text-amber-600 ring-amber-200/80",
    violet: "bg-violet-100 text-violet-600 ring-violet-200/80",
  };

  return (
    <article
      className="group animate-fade-in-up rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md sm:rounded-3xl sm:p-5"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-text-tertiary">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-background-subtle" />
          ) : (
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              {value}
            </p>
          )}
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105 sm:h-10 sm:w-10 ${tones[tone]}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-2 truncate text-xs text-text-tertiary">{detail}</p>
    </article>
  );
}

export function ContinueWatchingSection({
  item,
  videoSource,
  loading,
  ratingSaving,
  onRatingChange,
}: Readonly<{
  item: LastWatchedVideo | null;
  videoSource: string | null;
  loading: boolean;
  ratingSaving: boolean;
  onRatingChange: (rating: number) => void;
}>) {
  const mediaId = item?.media.id ?? null;
  const [fileMetadata, setFileMetadata] = useState<{
    mediaId: string;
    duration: number;
  } | null>(null);
  const fileDuration =
    fileMetadata?.mediaId === mediaId ? fileMetadata.duration : null;

  if (loading) {
    return (
      <section className="mt-8 animate-pulse overflow-hidden rounded-3xl border border-card-border bg-card/75 p-4 shadow-sm sm:p-5">
        <div className="grid gap-5 md:grid-cols-[minmax(17rem,0.9fr)_minmax(0,1.1fr)] md:items-center">
          <div className="aspect-video rounded-2xl bg-background-subtle" />
          <div className="px-1 py-2">
            <div className="h-3 w-28 rounded bg-background-subtle" />
            <div className="mt-4 h-7 w-2/3 rounded bg-background-subtle" />
            <div className="mt-5 h-2 w-full rounded-full bg-background-subtle" />
            <div className="mt-6 h-10 w-40 rounded-xl bg-background-subtle" />
          </div>
        </div>
      </section>
    );
  }

  if (!item) return null;

  const { media, mediaProgress } = item;
  const currentPosition = Math.max(0, mediaProgress.currentPosition ?? 0);
  const storedDuration = Math.max(0, media.duration ?? 0);
  const duration = fileDuration ?? storedDuration;
  const progress =
    duration > 0 ? Math.min(100, (currentPosition / duration) * 100) : 0;
  const href = `/library/media?libraryId=${media.libraryId}&mediaId=${media.id}`;

  return (
    <section
      className="mt-8 animate-fade-in-up overflow-hidden rounded-3xl border border-card-border bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-5"
      style={{ animationDelay: "0.18s" }}
      aria-label="Continue watching"
    >
      <div className="group grid gap-5 md:grid-cols-[minmax(17rem,0.9fr)_minmax(0,1.1fr)] md:items-center">
        <Link
          href={href}
          aria-label={`Resume ${media.filename}`}
          className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-950 shadow-inner"
        >
          {videoSource ? (
            <video
              src={videoSource}
              muted
              playsInline
              preload="metadata"
              aria-label={`Preview of ${media.filename}`}
              className="pointer-events-none h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.02]"
              onLoadedMetadata={(event) => {
                const videoDuration = event.currentTarget.duration;
                if (Number.isFinite(videoDuration) && videoDuration > 0) {
                  setFileMetadata({
                    mediaId: media.id,
                    duration: videoDuration,
                  });
                }
                const previewTime = Number.isFinite(videoDuration)
                  ? Math.min(currentPosition, Math.max(0, videoDuration - 0.1))
                  : currentPosition;
                event.currentTarget.currentTime = previewTime;
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-900">
              <Film className="h-12 w-12 text-white/25" strokeWidth={1.3} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/92 text-zinc-900 shadow-xl transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </div>
          </div>
          <span className="absolute bottom-3 right-3 rounded-lg bg-black/65 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {duration > 0 ? formatDuration(duration) : "--:--"}
          </span>
        </Link>

        <div className="min-w-0 px-1 py-1 sm:px-2">
          <div className="flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-emerald-500">
            <Play className="h-3.5 w-3.5 fill-current" />
            Continue watching
          </div>
          <h2 className="mt-3 truncate text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            {media.filename}
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-text-tertiary">
            <Clock3 className="h-4 w-4" />
            Last watched {formatDate(mediaProgress.lastWatched)}
          </p>

          <div className="mt-3">
            <RatingStars
              value={media.rating}
              onChange={onRatingChange}
              disabled={ratingSaving}
              size="sm"
              label={`Rating for ${media.filename}`}
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-4 text-xs text-text-secondary">
              <span>{Math.round(progress)}% watched</span>
              <span>
                {formatDuration(currentPosition)}
                {duration > 0 ? ` / ${formatDuration(duration)}` : " / --:--"}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-background-subtle">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Link
            href={href}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-active hover:shadow-md"
          >
            Resume video
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LibrarySection({
  showLibraryModal,
}: Readonly<LibraryPanelProps>) {
  return (
    <section
      className="mt-8 animate-fade-in-up rounded-3xl border border-card-border bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-7"
      style={{ animationDelay: "0.25s" }}
    >
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SectionHeading
          eyebrow="Collections"
          title="My libraries"
          description="Everything organized into calm, focused spaces."
          icon={FolderOpen}
        />

        <PrimaryButton onClick={showLibraryModal}>
          <span className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Create new library
          </span>
        </PrimaryButton>
      </div>
      <LibraryList />
    </section>
  );
}

export function NoteSection({
  notes,
  loading,
  compact = false,
}: Readonly<{
  notes: DashboardNote[];
  loading: boolean;
  compact?: boolean;
}>) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  if (compact) {
    const visibleNotes = notes.slice(0, 3);

    return (
      <aside
        className="animate-fade-in-up overflow-hidden rounded-3xl border border-card-border bg-card/75 shadow-sm backdrop-blur-sm"
        style={{ animationDelay: "0.5s" }}
      >
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="flex w-full cursor-pointer items-center gap-3 p-5 text-left transition-colors hover:bg-card-hover sm:p-6"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 ring-1 ring-sky-200/70">
            <Notebook className="h-5 w-5" strokeWidth={1.7} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-sky-600">
              Scribbles
            </p>
            <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-text-primary">
              Recent notes
            </h2>
          </div>
          <span className="rounded-full bg-background-subtle px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-text-tertiary">
            Latest 3
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-text-tertiary transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        <div
          id={contentId}
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="grid gap-3 border-t border-card-border px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
              {loading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <NoteSkeleton key={index} compact />
                ))}

              {!loading && visibleNotes.length === 0 && <EmptyNotes compact />}

              {!loading &&
                visibleNotes.map((note) => (
                  <NoteCard key={note.id} note={note} compact />
                ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <section
      className="animate-fade-in-up rounded-3xl border border-card-border bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-7"
      style={{ animationDelay: "0.32s" }}
    >
      <SectionHeading
        eyebrow="Scribbles"
        title="Recent notes"
        description="Small thoughts, always tied to the right moment."
        icon={Notebook}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <NoteSkeleton key={index} />
          ))}

        {!loading && notes.length === 0 && <EmptyNotes />}

        {!loading &&
          notes.map((note) => <NoteCard key={note.id} note={note} />)}
      </div>
    </section>
  );
}

function NoteCard({
  note,
  compact = false,
}: Readonly<{ note: DashboardNote; compact?: boolean }>) {
  const href = `/library/media?libraryId=${note.libraryId}&mediaId=${note.mediaId}`;

  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-card-border bg-background-subtle/55 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-md ${compact ? "min-h-36" : "min-h-44"}`}
    >
      <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-primary/8 transition-transform duration-500 group-hover:scale-150" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <StickyNote className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <p className="truncate text-xs font-medium text-text-tertiary">
            {note.libraryName}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-text-tertiary transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-active" />
      </div>

      <h3 className="relative mt-3 line-clamp-1 font-semibold text-text-primary">
        {note.title}
      </h3>
      <p className="relative mt-1.5 line-clamp-2 text-sm leading-5 text-text-secondary">
        {note.content || "A note saved without additional text."}
      </p>

      <div className="relative mt-auto flex items-center justify-between gap-3 pt-4 text-[0.7rem] text-text-tertiary">
        <span className="min-w-0 truncate">{note.mediaFilename}</span>
        <span className="flex shrink-0 items-center gap-1">
          <Clock3 className="h-3 w-3" />
          {note.timestamp !== null
            ? formatDuration(note.timestamp)
            : formatDate(note.updatedAt)}
        </span>
      </div>
    </Link>
  );
}

function NoteSkeleton({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-card-border bg-background-subtle/50 p-4 ${compact ? "min-h-36" : "min-h-44"}`}
    >
      <div className="h-8 w-8 rounded-lg bg-card-border" />
      <div className="mt-4 h-4 w-2/3 rounded bg-card-border" />
      <div className="mt-3 h-3 w-full rounded bg-card-border/80" />
      <div className="mt-2 h-3 w-4/5 rounded bg-card-border/80" />
    </div>
  );
}

function EmptyNotes({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <div
      className={`relative col-span-full overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-primary-subtle/30 px-6 text-center ${compact ? "py-7" : "py-10"}`}
    >
      <Sparkles className="mx-auto h-6 w-6 text-primary-active" />
      <h3 className="mt-3 font-semibold text-text-primary">
        Your best ideas will land here
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-text-secondary">
        Add a note while watching a video and it will appear here with a direct
        link back to that exact media file.
      </p>
    </div>
  );
}

export function MediaMixSection({
  mediaTypes,
  totalFiles,
  loading,
}: Readonly<{
  mediaTypes: MediaTypeCount[];
  totalFiles: number;
  loading: boolean;
}>) {
  return (
    <aside
      className="animate-fade-in-up rounded-3xl border border-card-border bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-7"
      style={{ animationDelay: "0.38s" }}
    >
      <SectionHeading
        eyebrow="At a glance"
        title="Media mix"
        description="What lives in your workspace."
        icon={Sparkles}
        compact
      />

      <div className="mt-6 space-y-4">
        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 w-24 rounded bg-background-subtle" />
              <div className="mt-2 h-2 w-full rounded-full bg-background-subtle" />
            </div>
          ))}

        {!loading && mediaTypes.length === 0 && (
          <p className="rounded-2xl bg-background-subtle/70 px-4 py-6 text-center text-sm text-text-secondary">
            Upload your first file to see the mix.
          </p>
        )}

        {!loading &&
          mediaTypes.map((item) => (
            <MediaTypeBar key={item.type} item={item} totalFiles={totalFiles} />
          ))}
      </div>

      <div className="mt-7 flex gap-3 rounded-2xl border border-primary/15 bg-primary-subtle/40 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-active" />
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Local-first by design
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            This overview is built from the data stored on your device.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function TopRatedSection({
  media,
  loading,
}: Readonly<{
  media: TopRatedMedia[];
  loading: boolean;
}>) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <aside
      className="animate-fade-in-up overflow-hidden rounded-3xl border border-card-border bg-card/75 shadow-sm backdrop-blur-sm"
      style={{ animationDelay: "0.44s" }}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="flex w-full cursor-pointer items-center gap-3 p-5 text-left transition-colors hover:bg-card-hover sm:p-6"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 ring-1 ring-amber-200/70">
          <Trophy className="h-5 w-5" strokeWidth={1.7} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-amber-600">
            Your favorites
          </p>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-text-primary">
            Top rated
          </h2>
        </div>
        <span className="rounded-full bg-background-subtle px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-text-tertiary">
          Top 5
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-text-tertiary transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-card-border px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
            {loading ? (
              <TopRatedSkeleton />
            ) : media.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-7 text-center">
                <Star className="mx-auto h-6 w-6 text-amber-400" />
                <p className="mt-2 text-sm font-medium text-text-primary">
                  No ratings yet
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Rate some media and your favorites will appear here.
                </p>
              </div>
            ) : (
              <ol className="space-y-2">
                {media.map((item, index) => (
                  <TopRatedItem
                    key={item.id}
                    item={item}
                    position={index + 1}
                  />
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopRatedItem({
  item,
  position,
}: Readonly<{ item: TopRatedMedia; position: number }>) {
  const presentation = getMediaTypePresentation(item.mediaType);
  const Icon = presentation.icon;
  const href = `/library/media?libraryId=${item.libraryId}&mediaId=${item.id}`;

  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-all hover:border-amber-200 hover:bg-amber-50/60"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${getRankBadgeStyle(position)}`}
        >
          {position}
        </span>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background-subtle">
          <Icon className={`h-4 w-4 ${presentation.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">
            {item.filename}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="truncate text-[0.68rem] text-text-tertiary">
              {item.libraryName}
            </span>
            <span className="flex shrink-0 items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-3 w-3 ${
                    index < item.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-zinc-300"
                  }`}
                />
              ))}
            </span>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-600" />
      </Link>
    </li>
  );
}

function getRankBadgeStyle(position: number): string {
  if (position === 1) {
    return "bg-amber-400 text-white ring-1 ring-amber-500/30";
  }
  if (position === 2) {
    return "bg-slate-300 text-slate-700 ring-1 ring-slate-400/40";
  }
  if (position === 3) {
    return "bg-orange-700 text-white ring-1 ring-orange-800/30";
  }
  return "bg-background-subtle text-text-tertiary";
}

function TopRatedSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 rounded-2xl p-2.5"
        >
          <div className="h-8 w-8 rounded-lg bg-background-subtle" />
          <div className="h-9 w-9 rounded-lg bg-background-subtle" />
          <div className="flex-1">
            <div className="h-3.5 w-3/4 rounded bg-background-subtle" />
            <div className="mt-2 h-2.5 w-1/2 rounded bg-background-subtle" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MediaTypeBar({
  item,
  totalFiles,
}: Readonly<{ item: MediaTypeCount; totalFiles: number }>) {
  const presentation = getMediaTypePresentation(item.type);
  const percentage = totalFiles > 0 ? (item.count / totalFiles) * 100 : 0;
  const Icon = presentation.icon;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2 font-medium text-text-secondary">
          <Icon className={`h-4 w-4 ${presentation.text}`} />
          <span className="truncate">{presentation.label}</span>
        </span>
        <span className="text-xs font-semibold text-text-primary">
          {item.count}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-background-subtle">
        <div
          className={`h-full min-w-1 rounded-full ${presentation.bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getMediaTypePresentation(type: string): {
  label: string;
  icon: LucideIcon;
  text: string;
  bar: string;
} {
  const normalized = type.toLowerCase();
  if (normalized.includes("video")) {
    return {
      label: "Videos",
      icon: Film,
      text: "text-emerald-500",
      bar: "bg-emerald-400",
    };
  }
  if (normalized.includes("image")) {
    return {
      label: "Images",
      icon: FileImage,
      text: "text-violet-500",
      bar: "bg-violet-400",
    };
  }
  if (normalized.includes("audio") || normalized.includes("recording")) {
    return {
      label: "Audio",
      icon: Music2,
      text: "text-sky-500",
      bar: "bg-sky-400",
    };
  }
  if (normalized.includes("pdf") || normalized.includes("text")) {
    return {
      label: "Documents",
      icon: FileText,
      text: "text-amber-500",
      bar: "bg-amber-400",
    };
  }
  return {
    label: "Other",
    icon: Files,
    text: "text-zinc-500",
    bar: "bg-zinc-400",
  };
}

function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
  compact = false,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  compact?: boolean;
}>) {
  return (
    <div className="flex items-center gap-3">
      <SectionIcon icon={icon} />
      <div className="min-w-0">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-emerald-500">
          {eyebrow}
        </p>
        <h2
          className={`mt-0.5 font-semibold tracking-tight text-text-primary ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"}`}
        >
          {title}
        </h2>
        <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function SectionIcon({ icon: Icon }: Readonly<{ icon: LucideIcon }>) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-active ring-1 ring-primary/10">
      <Icon className="h-5 w-5" strokeWidth={1.7} />
    </div>
  );
}
