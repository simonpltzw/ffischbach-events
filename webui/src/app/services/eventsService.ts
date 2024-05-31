import axios, { AxiosResponse } from "axios";
import { Event } from "../models/in/Event";
import { test_data } from "../assets/test";

export const getEvents = async (token: string): Promise<Event[]> => {
  /*const response = await axios.get<Event[]>(`${process.env.WEB_API}/api/Events`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return response.data;*/

  return test_data as Event[];
};

export const getEventById = async (token: string, id: string): Promise<Event> => {
  const response: AxiosResponse<Event> = await axios.get<Event>(
    `${process.env.WEB_API}/api/Events/${id}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  return response.data;
};

export const createEvent = async (token: string, newEvent: Event) => {
  const response: AxiosResponse<Event> = await axios.post(
    `${process.env.WEB_API}/api/Events`,
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
