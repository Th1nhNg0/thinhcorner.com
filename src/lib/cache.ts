export async function withCache<T>(
  kv: KVNamespace | undefined | null,
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
  shouldCache: (data: T) => boolean = (data) => {
    if (data === null || data === undefined) return false;
    if (Array.isArray(data)) {
      return data.length > 0;
    }
    if (typeof data === "object") {
      const keys = Object.keys(data);
      if (keys.length === 0) return false;
      const hasOnlyEmptyArrays = keys.every(
        (k) => Array.isArray((data as any)[k]) && (data as any)[k].length === 0
      );
      if (hasOnlyEmptyArrays) return false;
    }
    return true;
  }
): Promise<T> {
  if (!kv) {
    console.log(`[Cache] No KV namespace provided. Bypassing cache for key: ${key}`);
    return fetcher();
  }
  try {
    const cached = await kv.get(key);
    if (cached) {
      const parsed = JSON.parse(cached) as T;
      if (shouldCache(parsed)) {
        console.log(`[Cache] Hit for key: ${key}`);
        return parsed;
      }
      console.warn(`[Cache] Cached data for key: ${key} was empty or invalid. Re-fetching.`);
    }
  } catch (err) {
    console.error(`[Cache] Error reading key ${key} from KV:`, err);
  }

  console.log(`[Cache] Miss or invalid cache for key: ${key}. Fetching fresh data.`);
  const data = await fetcher();
  if (shouldCache(data)) {
    try {
      await kv.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
      console.log(`[Cache] Successfully cached data for key: ${key}`);
    } catch (err) {
      console.error(`[Cache] Error writing key ${key} to KV:`, err);
    }
  } else {
    console.warn(`[Cache] Fetch returned empty/invalid data for key: ${key}. Skipping caching.`);
  }
  return data;
}


