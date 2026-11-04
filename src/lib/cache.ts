// Entries outlive their TTL by this long so a failed refresh can serve the last
// good copy instead of an error page or an empty section.
const STALE_GRACE_SECONDS = 7 * 24 * 60 * 60;

interface CacheEntry<T> {
  __cachedAt: number; // epoch ms
  data: T;
}

/**
 * Returns the cached value while it is younger than `ttlSeconds`, otherwise calls
 * `fetcher`. If the refresh throws or comes back empty, the last good copy (kept up
 * to STALE_GRACE_SECONDS past its TTL) is served instead.
 */
export async function withCache<T>(
  kv: KVNamespace | undefined | null,
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  if (!kv) {
    return fetcher();
  }

  let stale: CacheEntry<T> | undefined;
  try {
    const cached = await kv.get(key);
    if (cached) {
      const entry = JSON.parse(cached) as CacheEntry<T> | T;
      if (isEntry<T>(entry)) {
        if (Date.now() - entry.__cachedAt < ttlSeconds * 1000) return entry.data;
        stale = entry;
      } else {
        // Written before entries carried a timestamp; still within its KV TTL.
        return entry;
      }
    }
  } catch (err) {
    console.error(`[Cache] Error reading key ${key} from KV:`, err);
  }

  let data: T;
  try {
    data = await fetcher();
  } catch (err) {
    if (!stale) throw err;
    console.error(`[Cache] Refresh failed for ${key}, serving stale copy:`, err);
    return stale.data;
  }

  if (isEmpty(data)) {
    // Fetchers swallow errors and return empty lists, so prefer the last good copy.
    return stale ? stale.data : data;
  }

  try {
    const entry: CacheEntry<T> = { __cachedAt: Date.now(), data };
    await kv.put(key, JSON.stringify(entry), {
      expirationTtl: ttlSeconds + STALE_GRACE_SECONDS,
    });
  } catch (err) {
    console.error(`[Cache] Error writing key ${key} to KV:`, err);
  }

  return data;
}

function isEntry<T>(value: unknown): value is CacheEntry<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CacheEntry<T>).__cachedAt === "number" &&
    "data" in value
  );
}

// Fetchers swallow errors and return empty lists, so an all-empty result usually
// means the upstream call failed. Don't pin that in KV for the whole TTL.
// Covers both `[]` and objects of lists like `{ current_reads: [], read: [] }`.
function isEmpty(data: unknown): boolean {
  if (data == null) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object") {
    const values = Object.values(data);
    return values.length > 0 && values.every(isEmpty);
  }
  return false;
}
