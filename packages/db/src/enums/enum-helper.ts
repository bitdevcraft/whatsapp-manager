export function enumToValues(e: Record<string, string>) {
  return Object.values(e) as [string, ...string[]];
}
