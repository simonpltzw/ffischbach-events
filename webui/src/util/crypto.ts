export const getKey = async (password: string, salt: Uint8Array<ArrayBuffer> | ArrayBuffer, usage: Iterable<KeyUsage>) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    {name: "PBKDF2"},
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 1000000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    usage,
  );
}
