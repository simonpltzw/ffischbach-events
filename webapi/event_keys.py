#!/usr/bin/env python3
"""
Create and decrypt event key material, matching the browser's WebCrypto flow.

Requires: pip install cryptography

    # Build a POST body for creating an event
    ./event_keys.py create RAUP2026 hunter2

    # Decrypt a stored value, taking the key material from the read response
    ./event_keys.py decrypt hunter2 --event event.json --value "kk5cgS6sI/cP..."
    curl .../api/events/RAUP2026 | ./event_keys.py decrypt hunter2 --event - --value "kk5c..."

    # Or pass the key material explicitly
    ./event_keys.py decrypt hunter2 --encrypted-key "..." --salt "..." --iv "..." --value "..."

    # Encrypt a value with only the public key, the way a registering user does
    ./event_keys.py encrypt --event event.json --value "Max Mustermann"
"""

from __future__ import annotations

import argparse
import base64
import json
import secrets
import sys

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# ---------------------------------------------------------------------------
# These MUST match the deriveKey() call in the frontend's util/crypto.ts.
# A mismatch surfaces as an InvalidTag on decrypt.
# ---------------------------------------------------------------------------
PBKDF2_ITERATIONS = 100_000
PBKDF2_HASH = hashes.SHA256()
AES_KEY_SIZE = 32  # AES-256-GCM
SALT_SIZE = 16     # new Uint8Array(16)
IV_SIZE = 12       # new Uint8Array(12)

RSA_MODULUS_BITS = 4096
EVENT_DATE = "2099-12-31T00:00:00Z"

# The UI's str2ab() uses charCodeAt(), so plaintext is latin-1, not UTF-8.
# Characters above U+00FF were already truncated in the browser.
DATA_ENCODING = "latin-1"

OAEP = padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)


def _wrap_pem(label: str, der: bytes) -> str:
    """The UI emits the base64 on a single line; match that byte for byte."""
    return f"-----BEGIN {label}-----\n{base64.b64encode(der).decode()}\n-----END {label}-----"


def _derive_key(password: str, salt: bytes) -> bytes:
    return PBKDF2HMAC(
        algorithm=PBKDF2_HASH,
        length=AES_KEY_SIZE,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    ).derive(password.encode("utf-8"))


# --------------------------------------------------------------------------- #
# Core operations
# --------------------------------------------------------------------------- #

def build_create_body(event_id: str, password: str) -> dict:
    """RSA-OAEP key pair plus a password-encrypted private key, as the UI builds it."""
    key = rsa.generate_private_key(public_exponent=65537, key_size=RSA_MODULUS_BITS)

    public_pem = _wrap_pem(
        "PUBLIC KEY",
        key.public_key().public_bytes(
            serialization.Encoding.DER,
            serialization.PublicFormat.SubjectPublicKeyInfo,
        ),
    )
    private_pem = _wrap_pem(
        "PRIVATE KEY",
        key.private_bytes(
            serialization.Encoding.DER,
            serialization.PrivateFormat.PKCS8,
            serialization.NoEncryption(),
        ),
    )

    salt = secrets.token_bytes(SALT_SIZE)
    iv = secrets.token_bytes(IV_SIZE)

    # The PEM *text* is encrypted, not the raw PKCS#8 DER.
    # AESGCM.encrypt appends the 16-byte tag, matching WebCrypto's layout.
    encrypted_key = AESGCM(_derive_key(password, salt)).encrypt(
        iv, private_pem.encode("utf-8"), None
    )

    # Round-trip now, so a wrong PBKDF2 constant fails here rather than
    # three layers into a debugging session.
    assert unlock_private_key(
        base64.b64encode(encrypted_key).decode(),
        password,
        base64.b64encode(salt).decode(),
        base64.b64encode(iv).decode(),
    ) == private_pem

    return {
        "id": event_id,
        "description": f"PW: {password}",
        "date": EVENT_DATE,
        "publicKey": public_pem,
        "encryptedPrivateKey": base64.b64encode(encrypted_key).decode(),
        "privateKeyEncryptionSalt": base64.b64encode(salt).decode(),
        "privateKeyEncryptionIV": base64.b64encode(iv).decode(),
    }


def unlock_private_key(encrypted_key_b64: str, password: str, salt_b64: str, iv_b64: str) -> str:
    """Counterpart to decryptKeyWithPassword() in passwordService.ts."""
    aes = AESGCM(_derive_key(password, base64.b64decode(salt_b64)))
    plaintext = aes.decrypt(
        base64.b64decode(iv_b64), base64.b64decode(encrypted_key_b64), None
    )
    return plaintext.decode("utf-8")


def decrypt_value(private_key_pem: str, encrypted_b64: str) -> str:
    """Counterpart to PrivateKeyService.decryptData()."""
    key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
    return key.decrypt(base64.b64decode(encrypted_b64), OAEP).decode(DATA_ENCODING)


def encrypt_value(public_key_pem: str, value: str) -> str:
    """Counterpart to publicKeyService.encryptData()."""
    key = serialization.load_pem_public_key(public_key_pem.encode())
    return base64.b64encode(key.encrypt(value.encode(DATA_ENCODING), OAEP)).decode()


# --------------------------------------------------------------------------- #
# Input plumbing
# --------------------------------------------------------------------------- #

# The read endpoint may not use the same casing as EventCreateModel, so accept
# a few spellings rather than failing on a field-name mismatch.
FIELD_ALIASES = {
    "encrypted_key": ["encryptedPrivateKey", "EncryptedPrivateKey"],
    "salt": ["privateKeyEncryptionSalt", "PrivateKeyEncryptionSalt", "salt", "Salt"],
    "iv": ["privateKeyEncryptionIV", "PrivateKeyEncryptionIV", "iv", "IV", "Iv"],
    "public_key": ["publicKey", "PublicKey"],
}


def _pick(event: dict, field: str):
    for alias in FIELD_ALIASES[field]:
        if event.get(alias):
            return event[alias]
    return None


def _load_event(path: str | None) -> dict:
    if path is None:
        return {}
    raw = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        sys.exit(f"Could not parse event JSON: {exc}")


def _resolve(event: dict, field: str, explicit, label: str):
    value = explicit or _pick(event, field)
    if not value:
        sys.exit(
            f"Missing {label}. Pass it directly, or supply --event with a read "
            f"response containing one of: {', '.join(FIELD_ALIASES[field])}"
        )
    return value


# --------------------------------------------------------------------------- #
# Commands
# --------------------------------------------------------------------------- #

def cmd_create(args) -> None:
    print(json.dumps(build_create_body(args.event_id, args.password), indent=2))


def cmd_decrypt(args) -> None:
    event = _load_event(args.event)

    encrypted_key = _resolve(event, "encrypted_key", args.encrypted_key, "encrypted private key")
    salt = _resolve(event, "salt", args.salt, "salt")
    iv = _resolve(event, "iv", args.iv, "IV")

    try:
        private_pem = unlock_private_key(encrypted_key, args.password, salt, iv)
    except InvalidTag:
        sys.exit(
            "Could not decrypt the private key. Either the password is wrong, or the "
            f"PBKDF2 settings here (SHA-256, {PBKDF2_ITERATIONS} iterations) do not "
            "match getKey() in util/crypto.ts."
        )

    for value in args.value:
        try:
            print(decrypt_value(private_pem, value))
        except ValueError as exc:
            print(f"[failed to decrypt: {exc}]", file=sys.stderr)


def cmd_encrypt(args) -> None:
    event = _load_event(args.event)
    public_key = _resolve(event, "public_key", args.public_key, "public key")

    for value in args.value:
        print(encrypt_value(public_key, value))


# --------------------------------------------------------------------------- #

def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    sub = parser.add_subparsers(dest="command", required=True)

    create = sub.add_parser("create", help="build an EventCreateModel POST body")
    create.add_argument("event_id", help="Event id, e.g. RAUP2026")
    create.add_argument("password", help="Password protecting the private key")
    create.set_defaults(func=cmd_create)

    decrypt = sub.add_parser("decrypt", help="decrypt stored values with the password")
    decrypt.add_argument("password")
    decrypt.add_argument("--value", required=True, action="append",
                         help="base64 ciphertext; repeat for multiple values")
    decrypt.add_argument("--event", help="event JSON file, or - for stdin")
    decrypt.add_argument("--encrypted-key", help="overrides the value from --event")
    decrypt.add_argument("--salt", help="overrides the value from --event")
    decrypt.add_argument("--iv", help="overrides the value from --event")
    decrypt.set_defaults(func=cmd_decrypt)

    encrypt = sub.add_parser("encrypt", help="encrypt a value using only the public key")
    encrypt.add_argument("--value", required=True, action="append",
                         help="plaintext; repeat for multiple values")
    encrypt.add_argument("--event", help="event JSON file, or - for stdin")
    encrypt.add_argument("--public-key", help="overrides the value from --event")
    encrypt.set_defaults(func=cmd_encrypt)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()