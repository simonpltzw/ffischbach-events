export class Participant {
  constructor(
    public id: number,
    public Email: string,
    public FirstName: string,
    public LastName: string,
    public BirthDate: string,
    public vip: boolean,
    public createdAt: string,
    public encryptedData?: string,
  ) {}
}
