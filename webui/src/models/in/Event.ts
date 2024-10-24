import { Category } from "../Category";
import { Group } from "./Group";

export class Event {
  constructor(
    public id: string,
    public description: string,
    public createdAt: string,
    public totalGroups: number,
    public totalParticipants: number,
    public completed: boolean,
    public encryptedPrivateKey: string,
    public categories: Category[],
    public date: string,
    public privateKey?: string,
    public publicKey?: string,
    public groups?: Group[],
    
  ) {
  }
}
