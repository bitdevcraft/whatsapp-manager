import { createCache } from "cache-manager";

const cacheStore = createCache();

export async function cacheData(params: {
  data: unknown;
  key: string;
  /** time-to-live in seconds */
  ttl?: number;
}) {
  const { data, key, ttl } = params;
  await cacheStore.set(key, data, ttl);
}

export function computeCacheKey(params: { context: string; id: string }) {
  return `${params.id}-${params.context}`;
}

export async function getCachedData<T = unknown>(
  key: string
): Promise<T | undefined> {
  const value = await cacheStore.get(key);
  return (value as T) ?? undefined;
}

export function getConversationContextCacheKey(phoneNumber: string) {
  return computeCacheKey({
    context: "conversation",
    id: phoneNumber,
  });
}
