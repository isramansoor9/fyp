import type { ReactNode } from "react";

type TocBilingualLabelProps = {
  english: string;
  urdu: boolean;
  map: Record<string, string>;
  /** Merged onto the outer wrapper (e.g. line-clamp-4, leading-snug). */
  className?: string;
};

/**
 * TOC row text only: canonical `english` is unchanged for URLs/APIs; Urdu is display-only.
 * In Urdu mode with a translation, English is shown first with Urdu aligned to the right.
 */
export function TocBilingualLabel({
  english,
  urdu,
  map,
  className = "",
}: TocBilingualLabelProps): ReactNode {
  const translated = urdu ? map[english] : undefined;
  if (!translated) {
    return (
      <span
        dir={urdu ? "ltr" : undefined}
        className={urdu ? ["english-in-urdu", className].filter(Boolean).join(" ") : className}
      >
        {english}
      </span>
    );
  }
  /** `dir="ltr"` so English stays visually left and Urdu right under page-level `urdu-text` (RTL). */
  return (
    <span
      dir="ltr"
      className={`inline-flex w-full min-w-0 max-w-full flex-row flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-left ${className}`}
    >
      <span className={["english-in-urdu", "min-w-0", "shrink", "text-left", "text-gray-900"].join(" ")}>
        {english}
      </span>
      <span
        className="shrink-0 max-w-[min(52%,18rem)] text-right text-[0.92em] leading-snug text-gray-700 sm:max-w-[48%] sm:text-[0.95em]"
        dir="rtl"
      >
        {translated}
      </span>
    </span>
  );
}
