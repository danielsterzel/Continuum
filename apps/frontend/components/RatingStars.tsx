"use client";

import { Star } from "lucide-react";
import { useState } from "react";

type RatingStarsProps = {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
};

const RATINGS = [1, 2, 3, 4, 5] as const;

export function RatingStars({
  value,
  onChange,
  disabled = false,
  size = "md",
  label = "Your rating",
}: Readonly<RatingStarsProps>) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const visibleRating = hoveredRating ?? value ?? 0;
  const iconSize = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        role="group"
        aria-label={label}
        onMouseLeave={() => setHoveredRating(null)}
      >
        {RATINGS.map((rating) => {
          const selected = rating <= visibleRating;

          return (
            <button
              key={rating}
              type="button"
              disabled={disabled}
              aria-label={`${rating} out of 5 stars`}
              aria-pressed={value === rating}
              title={`${rating}/5`}
              onMouseEnter={() => setHoveredRating(rating)}
              onFocus={() => setHoveredRating(rating)}
              onBlur={() => setHoveredRating(null)}
              onClick={() => onChange(rating)}
              className="cursor-pointer rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-wait disabled:opacity-60"
            >
              <Star
                className={`${iconSize} transition-colors ${
                  selected
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-zinc-300 hover:text-amber-300"
                }`}
                strokeWidth={1.8}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs font-medium text-text-tertiary">
        {value ? `${value}/5` : "Not rated"}
      </span>
    </div>
  );
}
