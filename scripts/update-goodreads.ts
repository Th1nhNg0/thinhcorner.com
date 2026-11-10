// Fetches the Goodreads shelves and writes them as JSON for the /data/books page.
//
//   bun scripts/update-goodreads.ts                    # writes data/goodreads.json
//   bun scripts/update-goodreads.ts --out <file>
//   bun scripts/update-goodreads.ts --previous <file>  # the last published copy
//   bun scripts/update-goodreads.ts --dry-run          # fetch and report, write nothing
//
// Run on a schedule by .github/workflows/goodreads.yml, which pushes the file to the
// `goodreads-data` branch.
//
// Goodreads no longer says when a book was read, so the sync keeps that itself: a
// book that is on the read shelf now and was not in the previous copy is stamped
// with the time of this run. Dates already in the previous copy are carried over.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { GOODREADS_USER_ID } from "../data/consts";
import {
  fetchShelves,
  isShelves,
  MAX_BOOKS,
  type Book,
  type Shelves,
} from "../src/lib/goodreads-shelves";

const args = process.argv.slice(2);
const flag = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const dryRun = args.includes("--dry-run");
const outPath = resolve(flag("--out") ?? "data/goodreads.json");
const previousPath = flag("--previous");

async function readPrevious(): Promise<Shelves | undefined> {
  if (!previousPath) return undefined;
  try {
    const data: unknown = JSON.parse(await readFile(previousPath, "utf8"));
    return isShelves(data) ? data : undefined;
  } catch {
    return undefined;
  }
}

const key = (book: Book) => book.id ?? book.url;

// The widget's covers are 98px wide. The image host resizes by file name, so ask
// for a sharper one, but only once a real request shows the larger size exists.
const larger = (cover: string) => cover.replace(/\._S[XY]\d+_\./, "._SX318_.");
async function sharpenCovers(shelves: Shelves): Promise<void> {
  const books = [...shelves.current_reads, ...shelves.read];
  const sample = books.find((book) => book.cover && larger(book.cover) !== book.cover);
  if (!sample?.cover) return;
  const res = await fetch(larger(sample.cover), { method: "HEAD" }).catch(() => undefined);
  const ok = !!res?.ok && (res.headers.get("content-type") ?? "").startsWith("image/");
  console.log(`Larger covers: ${ok ? "available" : `not available (HTTP ${res?.status ?? "error"})`}`);
  if (!ok) return;
  for (const book of books) if (book.cover) book.cover = larger(book.cover);
}

const shelves = await fetchShelves(GOODREADS_USER_ID);
console.log(
  `Goodreads: ${shelves.read.length} read, ${shelves.current_reads.length} currently reading`,
);
for (const book of shelves.read.slice(0, 3)) {
  console.log(`  ${book.rating}/5  ${book.title}, ${book.author}`);
}

// An empty "read" shelf means Goodreads did not really answer. Never publish that
// over a good copy.
if (shelves.read.length === 0) {
  console.error("Goodreads returned no read books; refusing to write an empty file.");
  process.exit(1);
}
if (shelves.read.length >= MAX_BOOKS) {
  console.warn(`The read shelf has reached the widget's limit of ${MAX_BOOKS}; older books are cut off.`);
}

await sharpenCovers(shelves);

const previous = await readPrevious();
if (previous) {
  const known = new Map(previous.read.map((book) => [key(book), book]));
  const now = new Date().toISOString();
  let finished = 0;
  for (const book of shelves.read) {
    const before = known.get(key(book));
    book.user_read_at = before ? before.user_read_at : now;
    if (before?.num_pages) book.num_pages = before.num_pages;
    if (!before) finished++;
  }
  console.log(`Newly finished since the last sync: ${finished}`);
} else {
  console.log("No previous copy: books keep no read date on this first run.");
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
