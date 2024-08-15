"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { getEvents } from "@/services/eventsService";
import { Event } from "@/models/in/Event";
import useToken from "@/services/tokenService";
import { Input } from "@/components/Input";
import { useToast } from "@/context/toast";
import { Button } from "@/components/Button";
import { CheckBox } from "@/components/CheckBox";
import { getLocalDateTime } from "@/util/converter";
import { CreateEventPopup } from "@/components/popups/createEventPopup";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-row justify-between gap-3 items-center mb-5">
        <span className="text-xl font-bold">Events</span>
        <Button type="button" className="bg-blue-600" onClick={onOpenCreate}>
          Event erstellen
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col-reverse flex-col gap-3 items-start mb-10">
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
            <CheckBox
              value={isFilterComplete}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFilterComplete(e.target.value == "true" ? true : false)
              }
            />
          </div>
        </div>
        <div className="grid grid-flow-row auto-rows-min gap-3 overflow-x-scroll md:overflow-x-auto">
          <span className="font-semibold">Event ID</span>
          <span className="font-semibold">Beschreibung</span>
          <span className="font-semibold">Gesamt anz. Gruppen</span>
          <span className="font-semibold">Gesamt anz. Teilnehmer</span>
          <span className="font-semibold">Erstellt</span>

          {eventList.length ? (
            <span className="font-bold col-span-5">Leer</span>
          ) : (
            eventList
              .filter((event: Event) => {
                return (
                  (event.id.includes(filter) ||
                    event.description.includes(filter) ||
                    filter == "") &&
                  isFilterComplete == event.completed
                );
              })
              .map((event: Event) => {
                return (
                  <div
                    key={event.id}
                    className="cursor-pointer grid grid-cols-subgrid justify-items-start place-items-center col-span-6 px-3 py-2 border dark:border-0 dark:bg-gray-900 rounded"
                    onClick={() => {
                      router.push(`/${event.id}`);
                    }}
                  >
                    <span>{event.id}</span>
                    <span>{event.description}</span>
                    <span>{event.totalGroups}</span>
                    <span>{event.totalParticipants}</span>
                    <span>{getLocalDateTime(event.createdAt)}</span>
                  </div>
                );
              })
          )}
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
