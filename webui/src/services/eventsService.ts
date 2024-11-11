import { Event } from "../models/in/Event";
import { EventOut } from "@/models/out/EventOut";
import { EditEvent } from "@/models/EditEvent";
import useClientFetch from "./fetch";

export const useEventService = () => {
  const { get, getOne, post, put } = useClientFetch();

  const getEvents = async (): Promise<Event[]> => {
    return get("/Events");
  };

  const getEventById = async (id: string): Promise<Event> => {
    return getOne(`/Events/${id}`);
  };

  const createEvent = async (newEvent: EventOut) => {
    return post(`/Events`, newEvent);
  };

  const putEvent = async (id: string, event: EditEvent) => {
    put(`/Events/${id}`, event);
  };

  const setEventCompleted = async (eventId: string) => {
    return post(`/Events/${eventId}/Complete`);
  };

  const addEventManager = async (eventId: string, email: string) => {
    return post(`/Events/${eventId}/EventManager?email=${email}`);
  };

  return {
    getEvents,
    getEventById,
    createEvent,
    putEvent,
    setEventCompleted,
    addEventManager,
  };
};
