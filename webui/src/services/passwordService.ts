import CryptoJS, { AES } from "crypto-js";
import { PrivateKeyService } from "./privateKeyService";

export const encryptWithPassword = async (password: string) => {
  const keyPair: CryptoKeyPair = await PrivateKeyService.generateKeyPair();
  const publicKey = await PrivateKeyService.exportPublicKey(keyPair.publicKey);

  return {
    publicKey,
    encryptedPrivateKey: await PrivateKeyService.exportPrivateKey(keyPair.privateKey, password),
  };
};

export const decryptKeyWithPassword = (content: string, password: string) => {
  return AES.decrypt(content, password).toString(CryptoJS.enc.Utf8);
};
