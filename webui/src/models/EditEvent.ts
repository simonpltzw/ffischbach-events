import { Event } from "./in/Event";

export interface EditEvent extends Pick<Event, "description" | "date" | "completed"> {}