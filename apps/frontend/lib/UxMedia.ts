// type TypeBadge = { label: string; className: string };

export function formatDuration(duration?: number | string | null): string {
  let seconds: number;

  if (typeof duration === "number") {
    seconds = duration;
  } else if (typeof duration === "string") {
    const numericDuration = Number(duration);

    if (Number.isFinite(numericDuration)) {
      seconds = numericDuration;
    } else {
      const isoDuration = duration.match(
        /^P(?:(\d+(?:\.\d+)?)D)?T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i,
      );

      if (!isoDuration) return "-";

      const [, days = "0", hours = "0", minutes = "0", remainingSeconds = "0"] =
        isoDuration;
      seconds =
        Number(days) * 86_400 +
        Number(hours) * 3_600 +
        Number(minutes) * 60 +
        Number(remainingSeconds);
    }
  } else {
    return "-";
  }

  if (!Number.isFinite(seconds) || seconds < 0) return "-";

  const totalSeconds = Math.floor(seconds);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
