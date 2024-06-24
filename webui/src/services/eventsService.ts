import axios, { AxiosResponse } from "axios";
import { Event } from "../models/in/Event";
import { EventOut } from "@/models/out/EventOut";

export const getEvents = async (token: string): Promise<Event[]> => {
  const response = await axios.get<Event[]>(`${process.env.NEXT_PUBLIC_WEB_API}/Events`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return response.data;
};

export const getEventById = async (token: string, id: string): Promise<Event> => {
  const response: AxiosResponse<Event> = await axios.get<Event>(
    `${process.env.NEXT_PUBLIC_WEB_API}/Events/${id}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  return response.data;
};

export const createEvent = async (token: string, newEvent: EventOut) => {
  const response: AxiosResponse<Event> = await axios.post(
    `${process.env.NEXT_PUBLIC_WEB_API}/Events`,
    newEvent,
    {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    }
  );
  return response;
};

export const updateEvent = () => {};
