"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { getEvents } from "@/services/eventsService";
import { CreateEventPopup } from "@/components/popups/CreateEventPopup";
import { Event } from "@/models/in/Event";
import useToken from "@/services/tokenService";
import { Input } from "@/components/Input";
import { ToggleButton } from "@/components/ToggleButton";
import { useToast } from "@/context/toast";

const Root: FC<any> = () => {
  const { addToast } = useToast();
  const [eventList, setEventList] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [isFilterComplete, setFilterComplete] = useState<boolean>(false);

  const [createPopupOpen, setCreatePopupOpen] = useState<boolean>(false);

  const router = useRouter();
  const { getToken } = useToken();

  const generateEventsList = async (): Promise<Event[]> => {
    return getToken().then(async (token: string) => {
      const eventIds: Event[] = await getEvents(token);
      return eventIds;
    });
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
    <>
      <div className="flex flex-row justify-between gap-3 items-center mb-5">
        <span className="text-xl font-bold">Events</span>
        <button className="rounded-md bg-blue-600 text-white p-2" onClick={onOpenCreate}>
          Event erstellen
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex sm:flex-row-reverse flex-col gap-3 sm:items-end items-start mb-5">
          <Input
            containerClassName="w-full"
            value={filter}
            title="Suche"
            placeholder=""
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
          />
          <div className="flex flex-col">
            <label className={`block text-sm font-bold h-fit mb-2`} htmlFor="username">
              Beendet
            </label>
            <ToggleButton
              value={isFilterComplete}
              className="h-10 w-20"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFilterComplete(e.target.value == "true" ? true : false)
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {eventList
            .filter((event: Event) => {
              return (
                (event.id.includes(filter) || event.description.includes(filter) || filter == "") &&
                isFilterComplete == event.completed
              );
            })
            .map((event: Event) => {
              return (
                <div
                  key={event.id}
                  className="cursor-pointer"
                  onClick={() => {
                    router.push(`/${event.id}`);
                  }}
                >
                  <div className="flex flex-row gap-6 items-center p-2 dark:bg-gray-900 rounded w-fit border border-2 dark:border-0 hover:bg-gray-100">
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
    </>
  );
};

export default Root;
