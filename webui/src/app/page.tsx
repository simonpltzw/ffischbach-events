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
import { CreateEventPopup } from "@/components/popups/CreateEvent";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table/Table";
import React from "react";
import { useFilterSettings } from "@/context/filterSettings";
import { Spinner } from "@/components/Spinner";

const Root: FC<any> = () => {
  const { addToast } = useToast();
  const [eventList, setEventList] = useState<Event[]>([]);

  const [isPending, setIsPending] = useState<boolean>();
  const [filter, dispatchFilter] = useFilterSettings();

  const router = useRouter();
  const { getToken } = useToken();

  const generateEventsList = async (): Promise<Event[]> => {
    return getToken().then(async (token: string) => {
      const eventIds: Event[] = await getEvents(token);
      return eventIds;
    });
  };

  const generateList = () => {
    const list = eventList
      .filter((event: Event) => {
        const f = filter.eventList?.eventFilter ?? "";

        return (
          (event.id.includes(f) || event.description.includes(f) || f == "") &&
          !!filter.eventList?.finished == event.completed
        );
      })
      .map((event: Event) => {
        return (
          <TR
            key={event.id}
            onClick={() => {
              router.push(`/${event.id}`);
            }}

            //className="cursor-pointer justify-items-start place-items-center p-3 border dark:border-0 dark:bg-gray-900 hover:bg-gray-200 hover:dark:bg-gray-700"
          >
            <TD>{event.id}</TD>
            <TD>{event.description}</TD>
            <TD>{event.totalGroups}</TD>
            <TD>{event.totalParticipants}</TD>
            <TD>{getLocalDateTime(event.createdAt)}</TD>
          </TR>
        );
      });

    if (list.length > 0) {
      return list;
    } else {
      return (
        <TR disabled>
          <TD colspan={5}>
            <div className="flex justify-center">
              {isPending ? <Spinner /> : "Keine Einträge gefunden"}
            </div>
          </TD>
        </TR>
      );
    }
  };

  useEffect(() => {
    setIsPending(true);
    generateEventsList().then((ids) => {
      setEventList(ids);
      setIsPending(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-row justify-between gap-3 items-center mb-5">
        <span className="text-xl font-bold">Events</span>
        <CreateEventPopup
          done={(newEvent: Event) => {
            setEventList([...eventList, newEvent]);
            addToast({ message: "Event erstellt", type: "info" });
          }}
        >
          <Button type="button" className="bg-blue-600">
            Event erstellen
          </Button>
        </CreateEventPopup>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 border dark:border-0 dark:bg-gray-900/40 shadow p-3 rounded-lg mb-5">
          <label className="text-lg font-bold">Filter</label>
          <div className="flex flex-row-reverse gap-5 items-start">
            <Input
              containerClassName="w-full"
              value={filter.eventList?.eventFilter ?? ""}
              title="Suche"
              placeholder=""
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                dispatchFilter({
                  eventList: {
                    finished: !!filter.eventList?.finished,
                    eventFilter: e.target.value,
                  },
                })
              }
            />
            <div className="flex flex-col">
              <label className={`block text-sm font-semibold h-fit mb-2`} htmlFor="username">
                Beendet
              </label>
              <CheckBox
                value={!!filter.eventList?.finished}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  dispatchFilter({
                    eventList: {
                      finished: e.target.checked,
                      eventFilter: filter.eventList?.eventFilter ?? "",
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        <Table>
          <THead>
            <tr>
              <TH>Event ID</TH>
              <TH>Beschreibung</TH>
              <TH>Gesamt anz. Gruppen</TH>
              <TH>Gesamt anz. Teilnehmer</TH>
              <TH>Erstellt</TH>
            </tr>
          </THead>
          <TBody>
            <>{generateList()}</>
          </TBody>
        </Table>
      </div>
    </>
  );
};

export default Root;
