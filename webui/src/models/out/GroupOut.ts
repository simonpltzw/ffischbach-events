import { ParticipantOut } from "./ParticipantOut";


export class GroupOut {
  constructor(
    public hashedName: string,
    public eventId: string,
    public encryptedName: string,
    public categoryId: string,
    public approved: boolean,
    public contact: ParticipantOut,
    public participants: ParticipantOut[],
  ) {}
}