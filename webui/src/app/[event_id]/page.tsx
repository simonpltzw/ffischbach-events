"use client";

import { ChangeEvent, Fragment, Reducer, useEffect, useLayoutEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { Group } from "@/models/in/Group";
import { Event } from "@/models/in/Event";
import { addEventManager, getEventById, setEventCompleted } from "@/services/eventsService";
import { PasswordPopup } from "@/components/popups/PasswordPopup";
import { AddEventManagerPopup } from "@/components/popups/AddEventManager";
import useToken from "@/services/tokenService";
import { PencilIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/context/toast";
import { Lock } from "@/components/Lock";
import { Button } from "@/components/Button";
import { ConfirmPopup } from "@/components/popups/ConfirmPopup";
import { InfoBadge } from "@/components/InfoBadge";
import { CheckBox } from "@/components/CheckBox";
import { getLocalDateTime } from "@/util/converter";
import { useEventSettings } from "@/context/eventSettings";
import { decryptEvent } from "@/services/decryptService";
import { useJsonToCsv } from "@/services/dataPreparationService";
import { Input } from "@/components/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table/Table";
import React from "react";
import { useFilterSettings } from "@/context/filterSettings";
import { Spinner } from "@/components/Spinner";

const EventPage = ({ params }: { params: { event_id: string } }) => {
  type StateActionType = "updateApproved" | "set" | "decGroups";

  interface StateAction {
    type: StateActionType;
    value: any;
    index?: number;
  }

  const router = useRouter();
  const { addToast } = useToast();
  const { getToken } = useToken();

  const [isPending, setIsPending] = useState<boolean>();
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [eventSettings, setEventSetting] = useEventSettings();
  const { parse } = useJsonToCsv();

  const [filter, dispatchFilter] = useFilterSettings();
  const [groupFilter, setGroupFilter] = useState<string>("");

  const [state, dispatch] = useReducer<Reducer<Event, any>>(
    (state: Event, action: StateAction): any => {
      switch (action.type) {
        case "updateApproved":
          if (action.index) {
            const groups: Group[] = state.groups!;
            groups[action.index].approved = action.value;
          }
          break;
        case "set":
          return action.value;
        case "decGroups":
          state.groups = action.value;
          return { ...state };
      }

      return state;
    },
    new Event("", "", "", 1, 1, false, "", "", "", [])
  );

  useLayoutEffect(() => {
    setIsPending(true);
    getToken().then((token: string) => {
      if (token) {
        getEventById(token, params.event_id).then((event) => {
          dispatch({ type: "set", value: event });
          setIsPending(false);
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    //objectId as indicator for initial object
    if (
      eventSettings &&
      eventSettings.password &&
      eventSettings.eventId == params.event_id &&
      state.id.length &&
      isEncrypted
    ) {
      onDecryptEvent(eventSettings.password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onCompleteEvent = () => {
    getToken().then((token: string) => {
      setEventCompleted(token, params.event_id);
      addToast({ message: "Event beendet", type: "info" });
    });
  };

  const onDecryptEvent = async (password: string, isManual?: boolean) => {
    try {
      state.groups = await decryptEvent(state, password);
      setEventSetting({ eventId: params.event_id, password });

      dispatch({ type: "decGroups", value: state.groups });
      setIsEncrypted(false);
      if (isManual) {
        addToast({ message: "Entschlüsselt", type: "info" });
      }
    } catch (e) {
      throw new Error("Falsches Passwort");
    }
  };

  const onAddEventManager = async (email: string) => {
    const token = await getToken();

    const response = await addEventManager(token, params.event_id, email);
    if (response) {
      addToast({ message: "Manager hinzugefügt", type: "info" });
    }
  };

  const generateGroupEntry = (group: Group, index: number) => {
    return (
      <TR key={`event-group-${index}`} disabled={isEncrypted}>
        <TD>{group.name ?? "***"}</TD>
        <TD>{group.category}</TD>
        <TD>
          <span className="mr-3">{group.contact.FirstName ?? "***"}</span>
          <span>{group.contact.LastName ?? "***"}</span>
        </TD>
        <TD>
          <CheckBox disabled value={!!group.approved} />
        </TD>
        <TD>{getLocalDateTime(group.createdAt)}</TD>
        <TD className="h-fit w-fit rounded-md cursor-pointer">
          {!isEncrypted && <PencilIcon height={20} />}
        </TD>
      </TR>
    );
  };

  const generateFilteredList = () => {
    const filteredList = state.groups
      ?.filter((group: Group) => {
        const f = groupFilter ?? "";

        return (
          (group.name?.includes(f) ||
            group.category.includes(f) ||
            group.createdAt.includes(f) ||
            f == "") &&
          filter.eventDetail?.approved == !!group.approved
        );
      })
      .map((group: Group, index: number) => generateGroupEntry(group, index));

    if (filteredList?.length != 0) {
      return filteredList;
    }
    return (
      <TR disabled>
        <TD colspan={6}>
          <div className="flex justify-center">
            {isPending ? <Spinner /> : "Keine Einträge gefunden"}
          </div>
        </TD>
      </TR>
    );
  };

  return (
    <>
      {state.completed && <InfoBadge text="Event ist beendet" />}
      <PasswordPopup title="Event entschlüsseln" disabled={!isEncrypted} done={onDecryptEvent}>
        <Lock isLocked={isEncrypted} />
      </PasswordPopup>

      <div className="mb-3 font-bold text-xl">Übersicht Gruppe</div>
      <div className="flex flex-row gap-3">
        <div>Event Name: </div>
        <h3 className="text-base font-semibold">{state?.id}</h3>
      </div>
      <div className="flex flex-row gap-3">
        <div>Beschreibung:</div>
        <div className="text-base font-semibold">{state?.description}</div>
      </div>
      {!state.completed && !isEncrypted && (
        <div className="flex flex-row gap-3 flex-wrap">
          <AddEventManagerPopup done={onAddEventManager}>
            <Button className="md:flex-none flex-1" type="button">
              Manager hinzufügen
            </Button>
          </AddEventManagerPopup>

          <ConfirmPopup title="Event beenden" done={onCompleteEvent}>
            <Button className="md:flex-none flex-1" type="button">
              Event beenden
            </Button>
          </ConfirmPopup>

          <Button
            className="md:flex-none flex-1"
            type="button"
            onClick={async () => {
              const data = await parse(state);
              const file = new File([data], "d.csv");
              const url = URL.createObjectURL(file);

              const a = document.createElement("a");
              a.href = url;
              a.download = file.name;

              document.body.appendChild(a);
              a.click();

              document.body.removeChild(a);
            }}
          >
            Event exportieren
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 border dark:border-0 dark:bg-gray-900/40 shadow p-3 rounded-lg mb-5">
          <label className="text-lg font-bold">Filter</label>
          <div className="flex flex-row-reverse gap-5 items-end">
            <Input
              containerClassName="w-full"
              value={groupFilter ?? ""}
              placeholder=""
              onChange={(e: ChangeEvent<HTMLInputElement>) => setGroupFilter(e.target.value)}
            />
            <div className="flex flex-col">
              <label className={`block text-sm font-semibold h-fit mb-2`} htmlFor="username">
                Genehmigt
              </label>
              <CheckBox
                value={!!filter.eventDetail?.approved}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  dispatchFilter({
                    eventDetail: {
                      approved: e.target.checked,
                      groupFilter: filter.eventDetail?.groupFilter ?? "",
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
              <TH>Name</TH>
              <TH>Kategorie</TH>
              <TH>Kontakt</TH>
              <TH>Genehmigt</TH>
              <TH>Erstellt</TH>
              <TH></TH>
            </tr>
          </THead>
          <TBody>
            <>{generateFilteredList()}</>
          </TBody>
        </Table>
      </div>
    </>
  );
};

export default EventPage;
