import dotenv from "dotenv";

dotenv.config();

export function loadEnv() {
  dotenv.config();
}

export function getEnv(key: string, fallback?: string) {
  const value = process.env[key] || fallback;
  if (!value) throw new Error(`Missing required env var: ${key}`);
  console.log(key, value);
  return value;
}
