export function insertAtCursor(
  el: HTMLInputElement | null,
  current: string,
  insertion: string,
  placeCursorAt?: number
) {
  if (!el) return current + insertion;
  const start = el.selectionStart ?? current.length;
  const end = el.selectionEnd ?? current.length;
  const newValue = current.slice(0, start) + insertion + current.slice(end);
  queueMicrotask(() => {
    const nextPos = placeCursorAt ?? start + insertion.length;
    try {
      el.setSelectionRange(nextPos, nextPos);
      el.focus();
    } catch {
      /* noop */
    }
  });
  return newValue;
}

// Get next positional index (e.g., next after {{1}} is 2)
export function nextPositionalIndex(text: string | undefined) {
  const nums = parsePositional(text);
  return nums.length ? Math.max(...nums) + 1 : 1;
}

export function parseNamed(text: string | undefined): string[] {
  if (!text) return [];
  const re = /\{\{\s*([^\s{}]+)\s*\}\}/g;
  const names: string[] = [];
  let m: null | RegExpExecArray;
  while ((m = re.exec(text))) names.push(m[1]!);
  return Array.from(new Set(names));
}

export function parsePositional(text: string | undefined): number[] {
  if (!text) return [];
  const matches = text.match(/\{\{\s*(\d+)\s*\}\}/g) || [];
  const nums = matches
    .map((m) => Number(m.replace(/[^\d]/g, "")))
    .filter((n) => Number.isFinite(n));
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}
