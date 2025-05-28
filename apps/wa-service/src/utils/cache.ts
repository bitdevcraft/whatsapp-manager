import { createCache } from "cache-manager";

const cacheStore = createCache();

export async function cacheData(params: {
  key: string;
  data: unknown;
  /** time-to-live in seconds */
  ttl?: number;
}) {
  const { key, data, ttl } = params;
  await cacheStore.set(key, data, ttl);
}

export async function getCachedData<T = unknown>(
  key: string
): Promise<T | undefined> {
  const value = await cacheStore.get(key);
  return (value as T) ?? undefined;
}

export function computeCacheKey(params: { id: string; context: string }) {
  return `${params.id}-${params.context}`;
}

export function getConversationContextCacheKey(phoneNumber: string) {
  return computeCacheKey({
    id: phoneNumber,
    context: "conversation",
  });
}
