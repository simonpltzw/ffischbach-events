"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FC, ReactNode, useEffect, useState } from "react";
import { Event } from "@/models/in/Event";
import useToken from "@/services/tokenService";
import { Input } from "@/components/Input";
import { useToast } from "@/context/toast";
import { Button } from "@/components/Button";
import { getLocalDateTime } from "@/util/converter";
import { CreateEventPopup } from "@/components/popups/CreateEvent";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table/Table";
import React from "react";
import { useFilterSettings } from "@/context/filterSettings";
import { Spinner } from "@/components/Spinner";
import { DataList } from "@/components/DataList";
import { useEventService } from "@/services/eventsService";
import useErrorHandler from "@/services/errorHandler";

const Root: FC = () => {
  const { addToast } = useToast();
  const [eventList, setEventList] = useState<Event[]>([]);

  const [isPending, setIsPending] = useState<boolean>();
  const [filter, dispatchFilter] = useFilterSettings();
  const errorHandler = useErrorHandler()

  const router = useRouter();
  const {getEvents} = useEventService()

  const generateEventsList = async (): Promise<Event[]> => {
    try {
      const eventIds: Event[] = await getEvents();
      return eventIds;
    } catch(e: any) {
      errorHandler(e)
      return []
    }
  };

  const generateList = (f: string, isEnded?: boolean): ReactNode[] => {
   return eventList
      .filter((event: Event) => {
        return (
          (event.id.includes(f) || event.description.includes(f) || f == "") &&
          event.completed == !!isEnded
        );
      })
      .sort((a, b) => {
        if (a.date >= b.date) {
          return 1;
        } else {
          return -1;
        }
      })
      .map((event: Event) => {
        return (
          <TR
            key={event.id}
            onClick={() => {
              router.push(`/${event.id}`);
            }}
          >
            <TD>{event.id}</TD>
            <TD>{event.description}</TD>
            <TD>{event.totalGroups}</TD>
            <TD>{event.totalParticipants}</TD>
            <TD>{getLocalDateTime(event.date)}</TD>
          </TR>
        );
      });
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
      <div className="flex flex-row justify-between gap-3 items-center mb-2">
        <span className="text-xl font-bold">Events</span>
      </div>
      <div className="flex flex-col gap-6">
        <DataList
        colSpan={6}
          title="Aktive Events"
          filter={filter.eventList?.eventFilter}
          isPending={isPending}
          dispatchCb={(value) => {
            dispatchFilter({
              eventList: {
                eventFilter: value,
                eventFilterEnded: filter.eventList?.eventFilterEnded ?? "",
              },
            });
          }}
          actions={
            <CreateEventPopup
              done={(newEvent: Event) => {
                setEventList([...eventList, newEvent]);
                addToast({ message: "Event erstellt", type: "info" });
              }}
            >
              <Button type="button" className="bg-blue-600">
                Neues Event erstellen
              </Button>
            </CreateEventPopup>
          }
          generateList={() => generateList(filter.eventList?.eventFilter ?? "")}
          tableHeaders={["Event ID", "Beschreibung", "Anz. Gruppen", "Anz. Teilnehmer", "Datum"]}
        />

        <DataList
        colSpan={6}
          title="Abgeschlossene Events"
          filter={filter.eventList?.eventFilterEnded}
          isPending={isPending}
          dispatchCb={(value) => {
            dispatchFilter({
              eventList: {
                eventFilter: filter.eventList?.eventFilter ?? "",
                eventFilterEnded: value,
              },
            });
          }}
          generateList={() => generateList(filter.eventList?.eventFilterEnded ?? "", true)}
          tableHeaders={["Event ID", "Beschreibung", "Anz. Gruppen", "Anz. Teilnehmer", "Datum"]}
        />
      </div>
    </>
  );
};

export default Root;
