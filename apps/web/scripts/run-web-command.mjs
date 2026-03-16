import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

const require = createRequire(import.meta.url);
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Missing command");
  process.exit(1);
}

loadCommandEnv(command);

if (command === "start") {
  process.env.PORT ??= "3001";
  process.env.HOSTNAME ??= "0.0.0.0";

  run(process.execPath, [getStandaloneServerPath()]);
} else {
  const nextBin = require.resolve("next/dist/bin/next");
  run(process.execPath, [nextBin, command, ...args]);
}

function loadCommandEnv(currentCommand) {
  const envFiles =
    currentCommand === "dev"
      ? [".env.development.local", ".env.local", ".env.development", ".env"]
      : [".env.production.local", ".env.local", ".env.production", ".env"];

  for (const envFile of envFiles) {
    const envPath = resolve(process.cwd(), envFile);

    if (!existsSync(envPath)) {
      continue;
    }

    loadEnv({
      override: false,
      path: envPath,
    });
  }
}

function run(commandName, commandArgs) {
  const child = spawn(commandName, commandArgs, {
    env: process.env,
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

function getStandaloneServerPath() {
  const serverCandidates = [
    resolve(process.cwd(), ".next/standalone/server.js"),
    resolve(process.cwd(), ".next/standalone/apps/web/server.js"),
  ];

  const serverPath = serverCandidates.find((candidate) => existsSync(candidate));

  if (!serverPath) {
    throw new Error("Standalone server.js was not found. Run the build first.");
  }

  return serverPath;
}
