import type { ImageMetadata } from "astro";
import booksCover from "@/assets/data/covers/books.svg";
import musicCover from "@/assets/data/covers/music.svg";
import chessCover from "@/assets/data/covers/chess.svg";
import steamCover from "@/assets/data/covers/steam.svg";
import tokenUsageCover from "@/assets/data/covers/token-usage.svg";

export type Analysis = {
  href: string;
  title: string;
  /** Where the numbers come from, shown next to the title. */
  source: string;
  description: string;
  /** Abstract cover in the same style as the project covers (src/assets/data/covers). */
  cover: ImageMetadata;
};

// One entry per /data page. Add new ones here and they show up on /data and the home page.
export const analyses: Analysis[] = [
  {
    href: "/data/books",
    title: "Books",
    source: "Goodreads",
    description: "Everything I have read on Goodreads, with covers and ratings.",
    cover: booksCover,
  },
  {
    href: "/data/music",
    title: "Music",
    source: "Spotify",
    description: "What I have been listening to lately, plus top tracks and artists over time.",
    cover: musicCover,
  },
  {
    href: "/data/chess",
    title: "Chess",
    source: "Chess.com",
    description: "Ratings, win rates, favourite openings and recent games from chess.com.",
    cover: chessCover,
  },
  {
    href: "/data/steam",
    title: "Steam",
    source: "Steam Web API",
    description: "My Steam library: where the hours went and what I am playing now.",
    cover: steamCover,
  },
  {
    href: "/data/token-usage",
    title: "Token usage",
    source: "ccusage",
    description: "Daily tokens and spend across the coding agents and models I use.",
    cover: tokenUsageCover,
  },
];
