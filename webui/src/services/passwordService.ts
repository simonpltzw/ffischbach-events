import { str2ab } from "@/util/converter";
import { PrivateKeyService } from "./privateKeyService";
import { getKey } from "@/util/crypto";

export const encryptWithPassword = async (password: string) => {
  const keyPair: CryptoKeyPair = await PrivateKeyService.generateKeyPair();
  const publicKey = await PrivateKeyService.exportPublicKey(keyPair.publicKey);

  const { key, salt, iv } = await PrivateKeyService.exportPrivateKey(
    keyPair.privateKey,
    password,
  );

  return {
    publicKey,
    encryptedPrivateKey: key,
    salt,
    iv,
  };
};

export const decryptKeyWithPassword = async (
  encryptedPrivateKeyB64: string,
  password: string,
  saltB64: string,
  ivB64: string,
) => {
  const textDecoder = new TextDecoder();

  const iv = str2ab(atob(ivB64));
  const salt = str2ab(atob(saltB64));
  const encryptedPrivateKey = str2ab(atob(encryptedPrivateKeyB64));

  const importedKey = await getKey(password, salt, ["decrypt"]);

  try {
    const arrayBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },

      importedKey,
      encryptedPrivateKey,
    );

    return textDecoder.decode(arrayBuffer);
  } catch (e) {
    console.error(e);
    throw e;
  }
};
