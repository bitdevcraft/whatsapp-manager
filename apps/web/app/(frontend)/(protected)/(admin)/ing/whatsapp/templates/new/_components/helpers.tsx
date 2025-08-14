/* -----------------------------
 * Helpers
 * ----------------------------- */

import React from "react";
import { useFormContext } from "react-hook-form";

/** Renders any errors at/under a given prefix (e.g. "components.1"). */
export function ErrorSummary({ name }: { name: string }) {
  const {
    formState: { errors },
  } = useFormContext();

  const items = React.useMemo(() => {
    const all: { path: string; message: string }[] = [];

    const visit = (node: any, path: string[] = []) => {
      if (!node || typeof node !== "object") return;

      // 1) primary message
      if (typeof node.message === "string" && node.message.trim()) {
        all.push({ path: path.join("."), message: node.message });
      }

      // 2) secondary messages (criteriaMode: "all")
      if (node.types) {
        if (Array.isArray(node.types)) {
          node.types.forEach((m: any) => {
            if (typeof m === "string" && m.trim()) {
              all.push({ path: path.join("."), message: m });
            }
          });
        } else if (typeof node.types === "object") {
          Object.values(node.types).forEach((m: any) => {
            if (typeof m === "string" && m.trim()) {
              all.push({ path: path.join("."), message: m });
            }
          });
        }
      }

      // 3) recurse children
      for (const key of Object.keys(node)) {
        if (
          key === "type" ||
          key === "message" ||
          key === "ref" ||
          key === "types"
        )
          continue;
        visit(node[key], [...path, key]);
      }
    };

    visit(errors);

    const prefix = name.replace(/\.$/, "");
    return all.filter(
      (e) => e.path === prefix || e.path.startsWith(prefix + ".")
    );
  }, [errors, name]);

  if (!items.length) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-md border border-destructive/30 bg-destructive/5 p-3"
    >
      <ul className="list-disc pl-5 space-y-1 text-sm text-destructive">
        {items.map((m, i) => (
          <li key={`${m.path}-${i}`}>{m.message}</li>
        ))}
      </ul>
    </div>
  );
}
