export async function withCache<T>(
  kv: KVNamespace,
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await kv.get(key);
  if (cached) return JSON.parse(cached) as T;

  const data = await fetcher();
  await kv.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
  return data;
}
