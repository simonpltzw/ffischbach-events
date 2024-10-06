export class EventOut {
  constructor(
    public id: string,
    public description: string,
    public publicKey: string,
    public encryptedPrivateKey: string
  ) {}
}
