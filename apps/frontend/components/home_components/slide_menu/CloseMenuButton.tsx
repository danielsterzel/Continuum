import { X } from "lucide-react";

type CloseMenuButtonProps = {
    onClose: () => void;
}

export function CloseMenuButton({onClose}: Readonly<CloseMenuButtonProps>) {
  return (
    <button
      onClick={onClose}
      className="text-text-tertiary hover:text-text-primary transition-colors duration-200 text-xl"
      aria-label="Close menu"
    >
      <X className="w-6 h-6 cursor-pointer" />
    </button>
  );
}
