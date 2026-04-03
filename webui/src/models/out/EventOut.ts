export class EventOut {
  constructor(
    public id: string,
    public description: string,
    public date: string,
    public publicKey: string,
    public encryptedPrivateKey: string,
    public PrivateKeyEncryptionSalt: string,
    public PrivateKeyEncryptionIV: string
  ) {}
}
