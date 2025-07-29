import { z, ZodNumber, ZodOptional } from "zod";

export function IntegerString<
  schema extends ZodNumber | ZodOptional<ZodNumber>,
>(schema: schema) {
  return z.preprocess(
    (value) =>
      typeof value === "string"
        ? parseInt(value, 10)
        : typeof value === "number"
          ? value
          : undefined,
    schema
  );
}

// 1) A helper that turns various inputs into a Date:
//    • "YYYY-MM-DD" → parsed via regex (no timezone shenanigans)
//    • ISO strings or timestamps → via new Date()
//    • Date instances → passed through
const toDate = z.preprocess((val) => {
  // Already a Date?
  if (val instanceof Date) return val;

  // A pure "YYYY-MM-DD" string?
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split("-").map(Number);
    // monthIndex is zero-based:
    return new Date(y!, m! - 1, d);
  }

  // Any other string or number → try Date constructor
  if (typeof val === "string" || typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }

  // Reject anything else
  return undefined;
}, z.date());

// 2) Transform that Date → "YYYY-MM-DD" string
export const DateOnlySchema = toDate.transform((date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
});
