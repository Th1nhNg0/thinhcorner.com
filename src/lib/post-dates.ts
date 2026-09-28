import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { CollectionEntry } from "astro:content";

const git = (args: string[]) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

// A shallow clone (typical in CI) only knows the tip commit, so every file would
// look modified at the time of the latest push. Only trust git with full history.
let hasFullHistory: boolean | undefined;
function canUseGitHistory(): boolean {
  if (hasFullHistory === undefined) {
    try {
      hasFullHistory = git(["rev-parse", "--is-shallow-repository"]) === "false";
    } catch {
      hasFullHistory = false;
    }
  }
  return hasFullHistory;
}

function lastCommitDate(file: string): Date | undefined {
  if (!canUseGitHistory()) return undefined;
  try {
    const iso = git(["log", "-1", "--format=%cI", "--", file]);
    return iso ? new Date(iso) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * When a post was last meaningfully changed: the `updated` frontmatter field,
 * else the last git commit touching the post file, else the publish date.
 * File mtimes are never used — a fresh checkout resets them to clone time.
 */
export function getModifiedDate(post: CollectionEntry<"writing">): Date {
  if (post.data.updated) return post.data.updated;

  const postDir = join(process.cwd(), "data/writing", post.id);
  const postFile = ["index.md", "index.mdx"]
    .map((f) => join(postDir, f))
    .find((f) => existsSync(f));
  const committed = postFile ? lastCommitDate(postFile) : undefined;

  return committed && committed > post.data.date ? committed : post.data.date;
}
