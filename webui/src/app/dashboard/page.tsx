"use client";

import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { getEvents } from "@/services/eventsService";
import { CreateEventPopup } from "@/components/popups/CreateEventPopup";
import { Event } from "@/models/in/Event";
import useToken from "@/services/tokenService";
import { useToast } from "@/context/toast";

const Root: FC<any> = () => {
  const { addToast } = useToast();
  const [eventList, setEventList] = useState<Event[]>([]);

  const [createPopupOpen, setCreatePopupOpen] = useState<boolean>(false);

  const router = useRouter();
  const {getToken} = useToken()

  const generateEventsList = async (): Promise<Event[]> => {
    return getToken().then(
      async (token: string) => {
        const eventIds: Event[] = await getEvents(token);
        return eventIds;
      }
    );
  };

  const onOpenCreate = () => {
    setCreatePopupOpen(true);
  };

  useEffect(() => {
    generateEventsList().then((ids) => {
      setEventList(ids);
    });
  }, []);

  return (
    <div className="relative flex flex-row justify-center w-screen h-screen mx-auto">
      <div className="mx-5 mt-5 bg-gray-700 h-fit w-[80%] rounded-b-md p-4 bg-gray-600 rounded-md">
        <div className="flex flex-row justify-between gap-3 items-center mb-5">
          <span>Events</span>
          <button className="rounded-md bg-blue-600 text-white p-2" onClick={onOpenCreate}>
            Create Event
          </button>
        </div>
        <div className="flex flex-col gap-3">
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
          addToast({ message: "Event erstellt", type: "info" });
        }}
      />
    </div>
  );
};

export default Root;
