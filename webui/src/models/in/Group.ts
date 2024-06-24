import { Event } from "./Event";
import { Participant } from "./Participant";

export class Group {
  constructor(
    public id: number,
    public hashedName: string,
    public name: string,
    public category: string,
    public approved: boolean,
    public contact: Participant,
    public participants: Participant[],
    public createdAt: string,
    public encryptedName?: string,
    public event?: Event
  ) {}
}

export  const clone = (g: Group): Group => {
  const copy = new Group(
    g.id,
    g.hashedName,
    g.name,
    g.category,
    g.approved,
    g.contact,
    g.participants,
    g.createdAt
  );
  return copy;
}
