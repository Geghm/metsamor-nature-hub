import type { ImageKey } from "@/data/content";
import hero from "@/assets/hero-nature.jpg";
import vordan from "@/assets/t-vordan-karmir.jpg";
import bio from "@/assets/t-biodiversity.jpg";
import land from "@/assets/t-landscapes.jpg";
import trad from "@/assets/t-traditions.jpg";
import green from "@/assets/t-green.jpg";
import aware from "@/assets/t-awareness.jpg";

/** Illustrative photography (not of specific verified locations). */
export const HERO_IMAGE = hero;

export const IMAGES: Record<ImageKey, string> = {
  "vordan-karmir": vordan,
  biodiversity: bio,
  landscapes: land,
  traditions: trad,
  green,
  awareness: aware,
};
