"use client";

import { getEvents } from "@/app/services/eventsService";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";
import Navigation from "../components/navigation/navbar";
import { useMsal } from "@azure/msal-react";
import { AuthenticationResult } from "@azure/msal-browser";
import { getToken } from "../services/tokenService";
import { Event } from "../models/in/Event";
import { CreateEventPopup } from "../components/popups/createEventPopup";
import { Scrollbars } from "rc-scrollbars";

const Dashboard = () => {
  const [eventList, setEventList] = useState<Event[]>([]);

  const [createPopupOpen, setCreatePopupOpen] = useState<boolean>(false);

  const router = useRouter();
  const { instance, accounts } = useMsal();

  const generateEventsList = useCallback(async (): Promise<void> => {
    const elementList: ReactNode[] = [];

    getToken(instance, accounts[0]).then(async (accessTokenResponse: AuthenticationResult) => {
      const token = accessTokenResponse.accessToken;
      const eventIds: Event[] = await getEvents(token);

      setEventList(eventIds);
    });
  }, [accounts, instance]);

  const onOpenCreate = () => {
    setCreatePopupOpen(true);
  };

  useEffect(() => {
    generateEventsList();
  }, [generateEventsList]);

  return (
    <div className="relative flex flex-row justify-center w-screen h-screen mx-auto">
      <div className="mx-5 pt-5 bg-gray-700 p-2 h-fit w-[80%] rounded-b-md">
        <div className="flex flex-row justify-between gap-3 items-center mb-5">
          <span>Events</span>
        <button className="rounded-md bg-blue-600 text-white p-2" onClick={onOpenCreate}>Create Event</button>
        </div>

        <div
          className="flex flex-col gap-3 overflow-y-scroll"
          style={{ clipPath: "inset(0 20px 0 0)" }}
        >
          {eventList.map((event: Event) => {
            return (
              <div
                key={event.id}
                className="cursor-pointer"
                onClick={() => {
                  router.push(`/${event.id}`);
                }}
              >
                <div className="flex flex-row gap-6 items-center p-2 dark:bg-gray-800 rounded w-fit">
                  <div>{event.id}</div>
                  <span className="font-light">{event.description}</span>
                </div>
                
              </div>
            );
          })}
        </div>
      </div>

      <CreateEventPopup
        state={{ open: createPopupOpen, setOpen: setCreatePopupOpen }}
        done={(newEvent: Event) => {
          setEventList([...eventList, newEvent]);
        }}
      />
    </div>
  );
};

export default Dashboard;
