// lib/crypto.ts
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from "node:crypto";
import { getEnv } from "../env";

const KEY_HEX = getEnv("ENCRYPTION_KEY");
if (!KEY_HEX || !/^[0-9a-f]{64}$/i.test(KEY_HEX)) {
  throw new Error(
    "ENCRYPTION_KEY must be a 32-byte hex string (64 hex characters)"
  );
}

const key = Buffer.from(KEY_HEX, "hex"); // 32 bytes = 256-bit key

export interface EncryptedPayload {
  data: string; // base64 ciphertext+authTag
  iv: string; // base64 iv
}

export function decryptApiKey(payload: EncryptedPayload): string {
  const iv = Buffer.from(payload.iv, "base64");
  const encryptedData = Buffer.from(payload.data, "base64");

  const ciphertext = encryptedData.subarray(0, -16);
  const authTag = encryptedData.subarray(-16);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function encryptApiKey(plainText: string): EncryptedPayload {
  const iv = randomBytes(12); // AES-GCM standard IV length
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag(); // 16 bytes

  return {
    data: Buffer.concat([encrypted, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}
