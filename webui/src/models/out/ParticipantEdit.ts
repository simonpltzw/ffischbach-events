export class ParticipantEdit {
  constructor(
    public id: any,
    public groupId: string,
    public firstName: string,
    public lastName: string,
    public birthDate: string,
    public email?: string
  ) {}
}
