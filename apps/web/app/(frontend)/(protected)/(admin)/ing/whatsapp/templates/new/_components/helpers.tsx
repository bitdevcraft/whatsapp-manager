/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const all: { message: string; path: string }[] = [];

    const visit = (node: any, path: string[] = []) => {
      if (!node || typeof node !== "object") return;

      // 1) primary message
      if (typeof node.message === "string" && node.message.trim()) {
        all.push({ message: node.message, path: path.join(".") });
      }

      // 2) secondary messages (criteriaMode: "all")
      if (node.types) {
        if (Array.isArray(node.types)) {
          node.types.forEach((m: any) => {
            if (typeof m === "string" && m.trim()) {
              all.push({ message: m, path: path.join(".") });
            }
          });
        } else if (typeof node.types === "object") {
          Object.values(node.types).forEach((m: any) => {
            if (typeof m === "string" && m.trim()) {
              all.push({ message: m, path: path.join(".") });
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
      aria-live="polite"
      className="rounded-md border border-destructive/30 bg-destructive/5 p-3"
      role="alert"
    >
      <ul className="list-disc pl-5 space-y-1 text-sm text-destructive">
        {items.map((m, i) => (
          <li key={`${m.path}-${i}`}>{m.message}</li>
        ))}
      </ul>
    </div>
  );
}
