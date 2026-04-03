import { PrivateKeyService } from "./privateKeyService";

export const encryptWithPassword = async (password: string) => {
  const keyPair: CryptoKeyPair = await PrivateKeyService.generateKeyPair();
  const publicKey = await PrivateKeyService.exportPublicKey(keyPair.publicKey);

  const { key, salt, iv } = await PrivateKeyService.exportPrivateKey(keyPair.privateKey, password);

  return {
    publicKey,
    encryptedPrivateKey: key,
    salt,
    iv,
  };
};

export const decryptKeyWithPassword = async (
  content: string,
  password: string,
  salt: string,
  iv: string
) => {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const importedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: textEncoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // const importedKey = await crypto.subtle.importKey(
  //   "pkcs8",
  //   textEncoder.encode(password),
  //   "AES-CBC",
  //   true,
  //   ["decrypt"],
  // );

  const arrayBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: textEncoder.encode(iv) },
    importedKey,
    textEncoder.encode(content)
  );
  return textDecoder.decode(arrayBuffer);
};
