import { GOODREADS_USER_ID } from "../../data/consts";
import { withCache } from "@/lib/cache";
import { fetchShelves, isShelves, type Shelves } from "@/lib/goodreads-shelves";

// A scheduled GitHub Action (.github/workflows/goodreads.yml) reads the shelves and
// pushes them to this branch; the page reads that copy. The sync also keeps the read
// dates, which Goodreads no longer publishes. Keeping the copy off master means a
// sync never adds commits there or rebuilds the site.
export const GOODREADS_DATA_BRANCH = "goodreads-data";
const DATA_URL = `https://raw.githubusercontent.com/Th1nhNg0/thinhcorner.com/${GOODREADS_DATA_BRANCH}/data/goodreads.json`;
const CACHE_KEY = "goodreads_shelves";
const CACHE_TTL_SECONDS = 30 * 60;
const EMPTY: Shelves = { current_reads: [], read: [] };

async function fetchSynced(): Promise<Shelves> {
  const res = await fetch(DATA_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${DATA_URL}`);
  const data: unknown = await res.json();
  if (!isShelves(data)) throw new Error("unexpected shape");
  return data;
}

/**
 * Books from the synced copy on the data branch (KV-cached). If that copy can't be
 * read, asks Goodreads directly, and if both fail returns empty shelves so the page
 * can show its notice. withCache serves the last good copy over an empty one.
 */
export async function get_book(kv: KVNamespace | undefined | null): Promise<Shelves> {
  return withCache(kv, CACHE_KEY, CACHE_TTL_SECONDS, async () => {
    try {
      return await fetchSynced();
    } catch (err) {
      console.error("[Goodreads] synced copy unavailable, asking Goodreads directly:", err);
    }
    try {
      return await fetchShelves(GOODREADS_USER_ID);
    } catch (err) {
      console.error("[Goodreads] Goodreads unavailable:", err);
      return EMPTY;
    }
  });
}
