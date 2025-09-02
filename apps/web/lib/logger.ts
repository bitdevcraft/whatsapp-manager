const isDebug =
  typeof process !== "undefined" &&
  process.env?.DEBUG?.toLowerCase() === "true";

function error(...args: unknown[]) {
  if (isDebug) console.error("[ERROR]", ...args);
}

function info(...args: unknown[]) {
  if (isDebug) console.info("[INFO]", ...args);
}

function log(...args: unknown[]) {
  if (isDebug) console.log("[LOG]", ...args);
}

function warn(...args: unknown[]) {
  if (isDebug) console.warn("[WARN]", ...args);
}

export const logger = {
  error,
  info,
  log,
  warn,
};
