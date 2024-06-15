export class Participant {
  public email?: string;
  public firstName?: string;
  public lastName?: string;
  public birthDate?: string;

  constructor(
    public id: number,
    public encryptedData: string,
    public vip: boolean,
    public createdAt: string
  ) {
    //todo encrypt data

    this.email = "";
    this.firstName = "";
    this.lastName = "";
    this.birthDate = "";
  }
}
