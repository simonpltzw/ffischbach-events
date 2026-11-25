import { ab2str, str2ab } from "@/util/converter";

export const importPublicKey = async (pem: string) => {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length - 1);

  const binaryDerString = window.atob(pemContents);
  const binaryDer = str2ab(binaryDerString);
  return await window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
};

export const encryptData = async (data: string, publicKey: CryptoKey) => {
  const b = ab2str(
    await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      str2ab(btoa(data))
    )
  );

  return window.btoa(b)
};
