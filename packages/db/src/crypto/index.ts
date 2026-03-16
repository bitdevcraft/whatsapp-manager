import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

import { getRequiredEnv } from "../env";

export interface EncryptedPayload {
  data: string;
  iv: string;
}

let cachedEncryptionKey: Buffer | null = null;

export function decryptApiKey(payload: EncryptedPayload): string {
  const iv = Buffer.from(payload.iv, "base64");
  const encryptedData = Buffer.from(payload.data, "base64");

  const ciphertext = encryptedData.subarray(0, -16);
  const authTag = encryptedData.subarray(-16);

  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function encryptApiKey(plainText: string): EncryptedPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    data: Buffer.concat([encrypted, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

function getEncryptionKey(): Buffer {
  if (cachedEncryptionKey) {
    return cachedEncryptionKey;
  }

  const keyHex = getRequiredEnv("ENCRYPTION_KEY");

  if (!/^[0-9a-f]{64}$/i.test(keyHex)) {
    throw new Error(
      "ENCRYPTION_KEY must be a 32-byte hex string (64 hex characters)"
    );
  }

  cachedEncryptionKey = Buffer.from(keyHex, "hex");
  return cachedEncryptionKey;
}
