export function enumToValues<T extends Record<string, string>>(e: T) {
  return Object.values(e) as [string, ...string[]];
}
