// Fetches the Goodreads shelves and writes them as JSON for the /data/books page.
//
//   bun scripts/update-goodreads.ts              # writes data/goodreads.json
//   bun scripts/update-goodreads.ts --out <file>
//   bun scripts/update-goodreads.ts --dry-run    # fetch and report, write nothing
//
// Run on a schedule by .github/workflows/goodreads.yml, which pushes the file to the
// `goodreads-data` branch. The Worker can't fetch the feed itself: Goodreads turns
// away requests from Cloudflare's network.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { GOODREADS_USER_ID } from "../data/consts";
import { fetchShelves } from "../src/lib/goodreads-feed";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const outFlag = args.indexOf("--out");
const outPath = resolve(outFlag >= 0 ? args[outFlag + 1] : "data/goodreads.json");

const shelves = await fetchShelves(GOODREADS_USER_ID);
console.log(
  `Goodreads: ${shelves.read.length} read, ${shelves.current_reads.length} currently reading`,
);

// An empty "read" shelf means the feed did not really answer. Never publish that
// over a good copy.
if (shelves.read.length === 0) {
  console.error("Goodreads returned no read books; refusing to write an empty file.");
  process.exit(1);
}

if (dryRun) {
  console.log("Dry run: nothing written.");
} else {
  await mkdir(dirname(outPath), { recursive: true });
  // No timestamp in the file, so an unchanged shelf produces an identical file and
  // the workflow has nothing to commit.
  await writeFile(outPath, `${JSON.stringify(shelves, null, 1)}\n`);
  console.log(`Wrote ${outPath}`);
}
