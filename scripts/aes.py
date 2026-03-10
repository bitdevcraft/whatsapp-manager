# pip install cryptography
import os
import sys
import json
import base64
import binascii
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

"""
Simple CLI for AES-256-GCM encryption/decryption.
Prompts for a 32-byte hex key, operation mode (e/d),
and plaintext or payload as needed.
"""

def main():
    # Prompt for AES key
    key_hex = input("Enter 32-byte AES key (hex, 64 chars): ").strip()
    try:
        key = binascii.unhexlify(key_hex)
        if len(key) != 32:
            raise ValueError()
    except Exception:
        print("Error: Key must be 64 hex characters (32 bytes).", file=sys.stderr)
        sys.exit(1)

    aesgcm = AESGCM(key)

    # Prompt for operation
    mode = input("Choose operation - encrypt (e) or decrypt (d): ").strip().lower()

    if mode == 'e':
        # Encryption
        plaintext = input("Enter plaintext to encrypt: ").encode('utf-8')
        iv = os.urandom(12)
        ciphertext = aesgcm.encrypt(iv, plaintext, None)

        payload = {
            "iv": base64.b64encode(iv).decode('utf-8'),
            "data": base64.b64encode(ciphertext).decode('utf-8')
        }
        print("\nEncrypted Payload:")
        print(json.dumps(payload, indent=2))

    elif mode == 'd':
        # Decryption
        iv_b64 = input("Enter iv (base64): ").strip()
        data_b64 = input("Enter data (base64 ciphertext+tag): ").strip()
        try:
            iv = base64.b64decode(iv_b64)
            ciphertext = base64.b64decode(data_b64)
            plaintext = aesgcm.decrypt(iv, ciphertext, None)

            print("\nDecrypted Plaintext:")
            print(plaintext.decode('utf-8'))
        except Exception as e:
            print("\nDecryption failed:", e, file=sys.stderr)
            sys.exit(1)

    else:
        print("Error: Invalid mode selected.", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
