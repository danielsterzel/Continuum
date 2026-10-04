const NOTE_TITLE_PATTERN =
  /^[\p{L}\p{N}\p{Emoji_Presentation}\p{Extended_Pictographic}\u200D\uFE0F ]+$/u;

export function isValidNoteTitle(value: string | undefined): value is string {
  return (
    typeof value === "string" &&
    [...value].length <= 50 &&
    NOTE_TITLE_PATTERN.test(value)
  );
}
