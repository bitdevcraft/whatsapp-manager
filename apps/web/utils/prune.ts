/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/prune.ts
type NonNullish<T> = T extends null | undefined ? never : T;

export type Pruned<T> = T extends (infer U)[]
  ? Pruned<NonNullish<U>>[]
  : T extends object
    ? {
        [K in keyof T as NonNullish<T[K]> extends never ? never : K]: Pruned<
          NonNullish<T[K]>
        >;
      }
    : T;

type Options = {
  removeEmptyObjects?: boolean;
  removeEmptyArrays?: boolean;
  removeEmptyStrings?: boolean;
  trimStrings?: boolean;
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  Object.prototype.toString.call(v) === "[object Object]";

/** Recursively remove nullish, empty objects/arrays, etc. */
export function prune<T>(
  input: T,
  opts: Options = {
    removeEmptyObjects: true,
    removeEmptyArrays: true,
    removeEmptyStrings: false,
    trimStrings: false,
  }
): Pruned<T> | undefined {
  // null or undefined → drop
  if (input == null) return undefined as any;

  // strings: optional trim + drop empty
  if (typeof input === "string") {
    const s = opts.trimStrings ? input.trim() : input;
    if (opts.removeEmptyStrings && s === "") return undefined as any;
    return s as any;
  }

  // arrays
  if (Array.isArray(input)) {
    const arr = input
      .map((x) => prune(x, opts))
      .filter((x) => x !== undefined) as unknown[];
    if (opts.removeEmptyArrays && arr.length === 0) return undefined as any;
    return arr as any;
  }

  // plain objects (keep Dates, Maps, etc. as-is)
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      const pruned = prune(v as any, opts);
      if (pruned !== undefined) out[k] = pruned;
    }
    if (opts.removeEmptyObjects && Object.keys(out).length === 0)
      return undefined as any;
    return out as any;
  }

  // everything else (number, boolean, Date, Map, Set, Blob, etc.)
  return input as any;
}

/** Convenience wrapper when you *know* the top-level is an object. */
export function pruneObject<T extends Record<string, any>>(
  obj: T,
  opts?: Options
): Pruned<T> {
  const r = prune(obj, opts);
  return (r && typeof r === "object" ? r : {}) as Pruned<T>;
}
