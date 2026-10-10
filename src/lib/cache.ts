export async function withCache<T>(
  kv: KVNamespace | undefined | null,
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  if (!kv) {
    return fetcher();
  }

  try {
    const cached = await kv.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.error(`[Cache] Error reading key ${key} from KV:`, err);
  }

  const data = await fetcher();
  if (!isEmpty(data)) {
    try {
      await kv.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
    } catch (err) {
      console.error(`[Cache] Error writing key ${key} to KV:`, err);
    }
  }

  return data;
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
