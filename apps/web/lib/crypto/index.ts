// lib/crypto.ts

import { env } from "@/env/server";

// ─────────────────────────────────────────────────────────────────────────────
// Expect ENCRYPTION_KEY as a 64-char hex string (32 bytes)
const KEY_HEX = env.ENCRYPTION_KEY!;
if (!KEY_HEX || !/^[0-9a-f]{64}$/i.test(KEY_HEX)) {
  throw new Error(
    "ENCRYPTION_KEY must be a 32-byte hex string (64 hex characters)"
  );
}

// Convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

const rawKey = hexToBytes(KEY_HEX);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface EncryptedPayload {
  data: string; // base64 ciphertext+tag
  iv: string; // base64 iv
}

/**
 * Decrypt a payload back into UTF-8 plaintext.
 */
export async function decryptApiKey(
  payload: EncryptedPayload
): Promise<string> {
  const iv = Uint8Array.from(Buffer.from(payload.iv, "base64"));
  const key = await getCryptoKey();

  const decrypted = await crypto.subtle.decrypt(
    { iv, name: "AES-GCM" },
    key,
    Buffer.from(payload.data, "base64")
  );

  return decoder.decode(decrypted);
}

/**
 * Encrypt a plaintext string, returning base64 iv + base64 ciphertext.
 */
export async function encryptApiKey(
  plainText: string
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit nonce
  const key = await getCryptoKey();

  const encrypted = await crypto.subtle.encrypt(
    { iv, name: "AES-GCM" },
    key,
    encoder.encode(plainText)
  );

  return {
    data: Buffer.from(encrypted).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
  };
}

/** Import the AES-GCM key once */
async function getCryptoKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", rawKey.buffer, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}
