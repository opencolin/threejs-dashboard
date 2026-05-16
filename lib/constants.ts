import type { Technique, Industry, Award } from "./sites";

export const TECHNIQUE_LABEL: Record<Technique, string> = {
  "scroll-driven": "Scroll-driven",
  "real-time-interactivity": "Real-time interactivity",
  "product-configuration": "Product configuration",
  "immersive-storytelling": "Immersive storytelling",
};

export const TECHNIQUES: Technique[] = [
  "scroll-driven",
  "real-time-interactivity",
  "product-configuration",
  "immersive-storytelling",
];

export const INDUSTRIES: Industry[] = [
  "Fashion",
  "Automotive",
  "Music",
  "Architecture",
  "Gaming",
  "Portfolio",
  "Tech",
  "Editorial",
  "Sports",
  "Beverage",
  "Film",
  "Crypto",
];

export const AWARDS: Award[] = ["Awwwards SOTM", "Awwwards SOTD", "Codrops Hot", "FWA", "CSSDA", "OFFF Pick"];

export type SortKey = "awards" | "performance" | "lightest" | "newest" | "alpha";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "awards", label: "Most decorated" },
  { key: "performance", label: "Best mobile perf" },
  { key: "lightest", label: "Lightest payload" },
  { key: "newest", label: "Newest first" },
  { key: "alpha", label: "A → Z" },
];
