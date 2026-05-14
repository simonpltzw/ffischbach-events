import { ab2str, str2ab } from "@/util/converter";
import { getKey } from "@/util/crypto";

export class PrivateKeyService {
  static decryptData = async (key: CryptoKey, encryptedData: string) => {
    const r = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, str2ab(atob(encryptedData)));
    return ab2str(r);
  };

  static importPrivateKey = async (pem: string) => {
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length - 1);

    const binaryDerString = window.atob(pemContents);
    const binaryDer = str2ab(binaryDerString);
    return await window.crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
    );
  };

  static generateKeyPair = async (): Promise<CryptoKeyPair> => {
    return await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  };

  static exportPublicKey = async (key: CryptoKey) => {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
  };

  static exportPrivateKey = async (
    key: CryptoKey,
    password: string,
  ): Promise<{ key: string; salt: string; iv: string }> => {
    // Export private key.
    const exported = await window.crypto.subtle.exportKey("pkcs8", key);
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;

    const encoder = new TextEncoder();

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const saltString = btoa(String.fromCharCode(...salt));

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ivString = btoa(String.fromCharCode(...iv));

    const _key = await getKey(password, salt, ["encrypt"])

    const arrBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      _key,
      encoder.encode(privateKey)
    );

    return {
      key: btoa(String.fromCharCode(...new Uint8Array(arrBuffer))),
      salt: saltString,
      iv: ivString,
    };
  };
}
