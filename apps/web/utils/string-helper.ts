export const toTitleCase = (
  input: string,
  replace?: Record<string, string>
): string =>
  input
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

export const toSnake = (s: string): string =>
  s
    .replace(/\s+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase()
    .trim();
