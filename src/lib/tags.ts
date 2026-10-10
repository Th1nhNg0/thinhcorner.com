import type { CollectionEntry } from "astro:content";

// Display names for tag slugs; unknown slugs fall back to the slug itself.
export const TAG_LABELS: Record<string, string> = {
  ai: "AI",
  business: "Business",
  data: "Data",
  economics: "Economics",
  finance: "Finance",
  games: "Games",
  geopolitics: "Geopolitics",
  history: "History",
  law: "Law",
  personal: "Personal",
  programming: "Programming",
  science: "Science",
  society: "Society",
  technology: "Technology",
  tools: "Tools",
};

export const tagLabel = (tag: string) => TAG_LABELS[tag] ?? tag;

type Post = CollectionEntry<"writing">;

/** Published posts that share the most tags with `post`, newest first on ties. */
export function getRelatedPosts(post: Post, all: Post[], limit = 3) {
  const tags = new Set(post.data.tags);
  return all
    .filter((p) => p.id !== post.id && !p.data.draft)
    .map((p) => ({ p, score: p.data.tags.filter((t) => tags.has(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.valueOf() - a.p.data.date.valueOf())
    .slice(0, limit)
    .map(({ p }) => p);
}
