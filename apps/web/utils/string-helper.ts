export function toTitleCase(
  input: string,
  replace?: Record<string, string>
): string {
  return input
    .toLowerCase()
    .split("_")
    .filter(Boolean) // guards against double‑underscores
    .map((word) => {
      if (replace && Object.keys(replace).includes(word)) {
        return replace[word];
      }

      return word[0]?.toUpperCase() + word.slice(1);
    })
    .join(" ");
}
