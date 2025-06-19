const isDebug =
  typeof process !== "undefined" &&
  process.env?.DEBUG?.toLowerCase() === "true";

function log(...args: unknown[]) {
  if (isDebug) console.log("[LOG]", ...args);
}

function warn(...args: unknown[]) {
  if (isDebug) console.warn("[WARN]", ...args);
}

function error(...args: unknown[]) {
  if (isDebug) console.error("[ERROR]", ...args);
}

function info(...args: unknown[]) {
  if (isDebug) console.info("[INFO]", ...args);
}

export const logger = {
  log,
  warn,
  error,
  info,
};
