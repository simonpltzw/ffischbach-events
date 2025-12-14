"use client";

import { ReactNode, Reducer, useLayoutEffect, useMemo, useReducer, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Group } from "@/models/in/Group";
import { Event } from "@/models/in/Event";
import { PasswordPopup } from "@/components/popups/PasswordPopup";
import { AddEventManagerPopup } from "@/components/popups/AddEventManager";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
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
import { TD, TR } from "@/components/table/Table";
import React from "react";
import { useFilterSettings } from "@/context/filterSettings";
import { Action } from "@/util/types";
import { Categories } from "./Categories";
import { EditEventPopup } from "@/components/popups/EditEventPopup";
import { EditEvent } from "@/models/EditEvent";
import { DataList } from "@/components/DataList";
import { useEventService } from "@/services/eventsService";
import useErrorHandler from "@/services/errorHandler";
import { useGroupService } from "@/services/groupsService";
import { EmailEditorPopup } from "@/components/popups/EmailEditorPopup";
import { useEmail } from "@/services/emailService";

const EventPage = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const params = useParams<{ event_id: string }>();

  const [isPending, setIsPending] = useState<boolean>();
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [eventSettings, setEventSetting] = useEventSettings();
  const { parse } = useJsonToCsv();
  const errorHandler = useErrorHandler();

  const { getEventById, setEventCompleted, addEventManager, putEvent } = useEventService();
  const {
    sendTestApprovalEmail,
    sendApprovalEmail,
    sendRegistrationEmail,
    sendTestRegistrationEmail,
  } = useEmail();
  const { getEventById, setEventCompleted, addEventManager, putEvent } = useEventService();
  const { deleteGroup } = useGroupService();

  const [filter, dispatchFilter] = useFilterSettings();

  const tableHeaders = useMemo(
    () => ["Name", "Kategorie", "Kontakt", "Genehmigt", "Erstellt", "", ""],
    []
  );

  const [state, dispatch] = useReducer<Event, [Action<Partial<Event>>]>(
    (state: Event, action: Action<Partial<Event>>): Event => {
      return {
        ...state,
        ...action,
      };
    },
    new Event("", "", "", 1, 1, false, "", [], "", "", "", "", "", [])
  );

  useLayoutEffect(() => {
    params.event_id = decodeURI(params.event_id);

    setIsPending(true);
    getEventById(params.event_id)
      .then((event: Event) => {
        dispatch(event);
        setIsPending(false);
        if (eventSettings && eventSettings.password && eventSettings.eventId == params.event_id) {
          onDecryptEvent(eventSettings.password, false, event);
        }
      })
      .catch((e) => errorHandler(e));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCompleteEvent = (isConfirmed: boolean) => {
    if (isConfirmed) {
      setEventCompleted(params.event_id)
        .then(() => addToast({ message: "Event beendet", type: "info" }))
        .catch((e) => errorHandler(e));
    }
  };

  const onDecryptEvent = async (password: string, isManual?: boolean, localState?: Event) => {
    try {
      if (!localState) {
        localState = state;
      }

      localState.groups = await decryptEvent(localState, password);
      setEventSetting({ eventId: params.event_id, password });

      dispatch({ groups: localState.groups });
      setIsEncrypted(false);
      if (isManual) {
        addToast({ message: "Entschlüsselt", type: "info" });
      }

      console.log(state);
    } catch (e) {
      throw new Error("Falsches Passwort");
    }
  };

  const onAddEventManager = async (email: string) => {
    try {
      const response = await addEventManager(params.event_id, email);
      if (response) {
        addToast({ message: "Manager hinzugefügt", type: "info" });
      }
    } catch (e: any) {
      errorHandler(e);
    }
  };

  const generateGroupEntry = (group: Group, index: number): ReactNode => {
    return (
      <TR
        id={group.id.toString()}
        key={`event-group-${group.id}`}
        disabled={isEncrypted}
        onClick={() => {
          if (!isEncrypted) {
            router.push(`/${state.id}/${group.id}`);
          }
        }}
      >
        <TD>{group.name ?? "***"}</TD>
        <TD>{group.category.name}</TD>
        <TD>
          <span className="mr-3">{group.contact.FirstName ?? "***"}</span>
          <span>{group.contact.LastName ?? "***"}</span>
        </TD>
        <TD>
          <CheckBox disabled value={!!group.approved} />
        </TD>
        <TD>{getLocalDateTime(group.createdAt)}</TD>
        <TD>
          {!isEncrypted && (
            <div className="flex justify-center items-center">
              <PencilIcon height={25} />
            </div>
          )}
        </TD>
        <TD className="h-fit w-fit rounded-md cursor-pointer">
          {!isEncrypted && (
            <div className="flex justify-center items-center">
              <ConfirmPopup
                title={`Gruppe "${group.name}" löschen`}
                done={(/*isConfirmed: boolean*/) => {
                  //todo: isConfirmed true -->
                  //if(isConfirmed) {
                  deleteGroup(group.id).then(() => {
                    const updatedGroup = state.groups?.filter((g: Group) => g.id != group.id)
                    dispatch({groups: updatedGroup})
                  }).catch((e) => errorHandler(e));
                  //}
                }}
              >
                <div title="Gruppe unwiderruflich löschen" className="group p-1 hover:bg-red-500 rounded">
                  <TrashIcon className="text-red-500 group-hover:text-white" height={25} />
                </div>
              </ConfirmPopup>
            </div>
          )}
        </TD>
      </TR>
    );
  };

  const generateFilteredList = (filter: string, isApproved?: boolean): ReactNode[] => {
    const filteredList = state.groups
      ?.filter((group: Group) => {
        const f = filter ?? "";
        return (
          (group.name?.includes(f) ||
            group.category.name.includes(f) ||
            group.createdAt.includes(f) ||
            f == "") &&
          isApproved == !!group.approved
        );
      })
      .map((group: Group, index: number) => generateGroupEntry(group, index));

    return filteredList ?? [];
  };

  const download = async () => {
    const data = await parse(state);
    const file = new File([data], "export.csv");
    const url = URL.createObjectURL(file);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
  };

  return (
    <>
      {state.completed && <InfoBadge text="Event ist beendet" />}
      <PasswordPopup title="Event entschlüsseln" disabled={!isEncrypted} done={onDecryptEvent}>
        <Lock isLocked={isEncrypted} />
      </PasswordPopup>

      <div className="mb-3 font-bold text-xl">Übersicht Event</div>
      <div className="flex flex-row gap-3">
        <div>Event Name: </div>
        <h3 className="text-base font-semibold">{state?.id}</h3>
      </div>
      <div className="flex flex-row gap-3">
        <div>Beschreibung:</div>
        <div className="text-base font-semibold">{state?.description}</div>
      </div>
      <div className="flex flex-row gap-3">
        <div>Veranstaltungsdatum:</div>
        <div className="text-base font-semibold">{getLocalDateTime(state?.date)}</div>
      </div>
      {!state.completed && !isEncrypted && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-3 flex-wrap">
            <EditEventPopup
              event={state}
              done={async (editedEvent: EditEvent) => {
                putEvent(state.id, editedEvent)
                  .then(() => {
                    dispatch(editedEvent);
                    addToast({
                      message: "Event aktualisiert",
                      type: "info",
                    });
                  })
                  .catch((e) => errorHandler(e));
              }}
            >
              <Button color="blue" className="md:flex-none flex-1 text-white" type="button">
                Event bearbeiten
              </Button>
            </EditEventPopup>

            <AddEventManagerPopup done={onAddEventManager}>
              <Button color="blue" className="md:flex-none flex-1 text-white" type="button">
                Manager hinzufügen
              </Button>
            </AddEventManagerPopup>
            <Button
              color="blue"
              className="md:flex-none flex-1 text-white"
              type="button"
              onClick={async () => { 
                await download();
                addToast({ message: "Event exportiert", type: "info" });
              }}
            >
              Event exportieren
            </Button>
            <ConfirmPopup title="Event beenden" done={onCompleteEvent}>
              <Button className="md:flex-none flex-1" type="button">
                Event beenden
              </Button>
            </ConfirmPopup>
          </div>
          <div className="flex flex-row gap-3">
            <EmailEditorPopup
              title="Email Bestätigung bearbeiten (HTML)"
              sendTestAction={sendTestApprovalEmail}
              eventId={params.event_id}
              emailContent={state.approvalEmailContent}
              done={async (approvalEmailContent) => {
                dispatch({ approvalEmailContent });
                const tempEvent: Event = { ...state, approvalEmailContent };

                await putEvent(params.event_id, tempEvent);
              }}
            >
              <Button color="blue" className="md:flex-none flex-1 text-white" type="button">
                Genehmigungsmail bearbeiten
              </Button>
            </EmailEditorPopup>
            <EmailEditorPopup
              title="Eingangsbestätigung bearbeiten (HTML)"
              sendTestAction={sendTestRegistrationEmail}
              eventId={params.event_id}
              emailContent={state.registrationEmailContent}
              done={async (registrationEmailContent) => {
                dispatch({ registrationEmailContent });
                const tempEvent: Event = { ...state, registrationEmailContent };

                await putEvent(params.event_id, tempEvent);
              }}
            >
              <Button color="blue" className="md:flex-none flex-1 text-white" type="button">
                Registrierungsmail bearbeiten
              </Button>
            </EmailEditorPopup>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <Categories state={state} dispatch={dispatch} isVisible={isEncrypted} />

        <DataList
          colSpan={7}
          disabled={isEncrypted}
          title="Ungenehmigte Gruppen"
          isPending={isPending}
          filter={filter.eventDetail?.groupFilter}
          dispatchCb={(value) => {
            dispatchFilter({
              eventDetail: {
                groupFilter: value,
                groupFilterApproved: filter.eventDetail?.groupFilterApproved ?? "",
              },
            });
          }}
          generateList={() => generateFilteredList(filter.eventDetail?.groupFilter ?? "", false)}
          tableHeaders={tableHeaders}
        />

        <DataList
          colSpan={7}
          disabled={isEncrypted}
          title="Genehmigte Gruppen"
          isPending={isPending}
          filter={filter.eventDetail?.groupFilterApproved}
          dispatchCb={(value) => {
            dispatchFilter({
              eventDetail: {
                groupFilter: filter.eventDetail?.groupFilter ?? "",
                groupFilterApproved: value,
              },
            });
          }}
          generateList={() =>
            generateFilteredList(filter.eventDetail?.groupFilterApproved ?? "", true)
          }
          tableHeaders={tableHeaders}
        />
      </div>
    </>
  );
};

export default EventPage;
