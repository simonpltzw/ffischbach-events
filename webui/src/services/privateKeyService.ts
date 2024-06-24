import { ab2str, base64ToArrayBuffer, str2ab } from "@/util/converter";
import CryptoJS, { AES } from "crypto-js";

export class PrivateKeyService {
  static decryptData = async (key: CryptoKey, encryptedData: string) => {
    const r = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, base64ToArrayBuffer(encryptedData));
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

  static exportPrivateKey = async (key: CryptoKey, password: string) => {
    // Export private key.
    const exported = await window.crypto.subtle.exportKey("pkcs8", key);
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;

    return AES.encrypt(privateKey, password).toString();
  };
}
