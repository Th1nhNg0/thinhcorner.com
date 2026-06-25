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
  try {
    await kv.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
  } catch (err) {
    console.error(`[Cache] Error writing key ${key} to KV:`, err);
  }

  return data;
}
