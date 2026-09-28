import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getModifiedDate } from "./post-dates";

/**
 * Last-modified date per page path (`/writing/<slug>`, plus `/` and `/writing`),
 * read straight from post frontmatter because the sitemap integration runs
 * outside Astro's content layer. Drafts are listed in `drafts`.
 */
export function getPostLastmods(root = "data/writing") {
  const lastmods = new Map<string, Date>();
  const drafts = new Set<string>();

  for (const dir of readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const file = ["index.md", "index.mdx"]
      .map((f) => join(root, dir.name, f))
      .find((f) => existsSync(f));
    if (!file) continue;

    const frontmatter = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
    const field = (key: string) =>
      frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]+)`, "m"))?.[1]?.trim();

    const path = `/writing/${dir.name}`;
    if (field("draft") === "true") {
      drafts.add(path);
      continue;
    }
    const date = field("date");
    if (!date) continue;
    const updated = field("updated");
    lastmods.set(
      path,
      getModifiedDate({
        data: { date: new Date(date), updated: updated ? new Date(updated) : undefined },
      }),
    );
  }

  const newest = [...lastmods.values()].reduce<Date | undefined>(
    (max, d) => (!max || d > max ? d : max),
    undefined,
  );
  if (newest) {
    lastmods.set("/", newest);
    lastmods.set("/writing", newest);
  }
  return { lastmods, drafts };
}
