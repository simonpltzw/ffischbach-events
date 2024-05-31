import { Group } from "./Group";

export class Event {
  constructor(
    public id: string,
    public description: string,
    public createdAt: string,
    public groups?: Group[],
  ) {}
}
