import { ChangeEventHandler, RefObject } from "react";

export function MultipleHiddenInput({
  fileInputRef,
  onChange,
  styling
}: {
  fileInputRef: RefObject<HTMLInputElement | null>;
  onChange: ChangeEventHandler<HTMLInputElement>;
  styling: string;
}) {
  return (
    <div className={`${styling}`}>
      <input
        multiple
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}
