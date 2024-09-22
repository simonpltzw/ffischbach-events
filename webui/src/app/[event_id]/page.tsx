"use client";

import { ChangeEvent, Reducer, useEffect, useReducer, useState } from "react";
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
import { useEventSettings } from "@/context/eventSettingsContext";
import { decryptEvent } from "@/services/decryptService";
import { useJsonToCsv } from "@/services/dataPreparationService";
import { Input } from "@/components/Input";

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
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [passwordPopupVisible, setPasswordPopupVisible] = useState<boolean>(false);
  const [managerPopupVisible, setManagerPopupVisible] = useState<boolean>(false);
  const [confirmCompletePopupVisible, setConfirmCompletePopupVisible] = useState<boolean>(false);
  const [eventSettings, setEventSetting] = useEventSettings();
  const {parse} = useJsonToCsv()

  const [filter, setFilter] = useState<string>("");
  const [filterApproved, setFilterApproved] = useState<boolean>(false);

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

  useEffect(() => {
    getToken().then((token: string) => {
      if (token) {
        getEventById(token, params.event_id).then((event) => {
          dispatch({ type: "set", value: event });
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
      onDecryptData(eventSettings.password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onCompleteEvent = () => {
    getToken().then((token: string) => {
      setEventCompleted(token, params.event_id);
      addToast({ message: "Event beendet", type: "info" });
    });
  };

  const onDecryptData = async (password: string) => {
    try {
      state.groups = await decryptEvent(state, password)
      setEventSetting({ eventId: params.event_id, password });

      dispatch({ type: "decGroups", value: state.groups });
      setIsEncrypted(false);
      addToast({ message: "Entschlüsselt", type: "info" });
    } catch (e) {
      throw new Error("Falsches Passwort");
    }
  };

  const onAddEventManager = async (email: string) => {
    const token = await getToken();
    
    const response = await addEventManager(token, params.event_id, email);
    if(response) {
      addToast({message: "Manager hinzugefügt", type: 'info'})
    }
  };

  const generateGroupEntry = (group: Group, index: number) => {
    return (
      <div
        key={`event-group-${index}`}
        className="grid grid-cols-subgrid justify-items-start place-items-center col-span-6 gap-3 px-3 py-2 border dark:border-0 dark:bg-gray-900 rounded hover:bg-gray-200 hover:dark:bg-gray-700"
      >
        <div>{group.name ?? "***"}</div>
        <div>{group.category}</div>
        <div>
          <div className="mr-3">{group.contact.FirstName ?? "***"}</div>
          <div>{group.contact.LastName ?? "***"}</div>
        </div>
        <div>
          <CheckBox disabled value />
        </div>
        <div>{getLocalDateTime(group.createdAt)}</div>
        <div
          className="h-fit w-fit rounded-md cursor-pointer"
          onClick={() => {
            router.push(`/${state.id}/${state.groups![index].id}`);
          }}
        >
          {!isEncrypted && <PencilIcon height={20} />}
        </div>
      </div>
    );
  };

  const generateFilteredList = () => {
    const filteredList = state.groups
      ?.filter((group: Group) => {
        return (
          (group.name?.includes(filter) ||
            group.category.includes(filter) ||
            group.createdAt.includes(filter) ||
            filter == "") &&
          filterApproved == group.approved
        );
      })
      .map((group: Group, index: number) => generateGroupEntry(group, index));

    if (filteredList?.length) {
      return filteredList;
    }
    return <span className="font-bold col-span-5">Leer</span>;
  };

  return (
    <>
      {state.completed && <InfoBadge text="Event ist beendet" />}
      <Lock isLocked={isEncrypted} openPopup={() => setPasswordPopupVisible(true)} />
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
          <Button
            className="md:flex-none flex-1"
            type="button"
            onClick={() => setManagerPopupVisible(true)}
          >
            Manager hinzufügen
          </Button>
          <Button
            className="md:flex-none flex-1"
            type="button"
            onClick={() => setConfirmCompletePopupVisible(true)}
          >
            Event beenden
          </Button>
          <Button
            className="md:flex-none flex-1"
            type="button"
            onClick={async () => {
              const data = await parse(state)
              const file = new File([data], 'd.csv')
              const url = URL.createObjectURL(file)

              const a = document.createElement("a")
              a.href = url
              a.download = file.name

              document.body.appendChild(a)
              a.click()

              document.body.removeChild(a)
            }}
          >
            Event exportieren
          </Button>
        </div>
      )}
      <div className="w-full">
        <div className="flex flex-col gap-3 border dark:border-0 dark:bg-gray-900/40 shadow  p-3 rounded-lg mb-3">
          <label className="text-lg font-semibold">Filter</label>
          <div className="flex flex-row-reverse gap-5 items-start">
            <Input
              containerClassName="w-full"
              value={filter}
              title="Suche"
              placeholder=""
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
            />
            <div className="flex flex-col">
              <label className={`block text-sm font-semibold h-fit mb-2`} htmlFor="username">
                Genehmigt
              </label>
              <CheckBox
                value={filterApproved}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFilterApproved(e.target.checked)
                }
              />
            </div>
          </div>
        </div>

        <div className="grid grid-flow-row auto-rows-min gap-3 justify-items-start overflow-x-scroll md:overflow-x-auto">
          <div className="font-extrabold col-span-6 mb-3">Gruppen</div>
          {
            <>
              <div className="font-bold">Name</div>
              <div className="font-bold">Kategorie</div>
              <div className="font-bold">Kontakt</div>
              <div className="font-bold">Genehmigt</div>
              <div className="font-bold">Erstellt</div>
              <div></div>

              {generateFilteredList()}
            </>
          }
        </div>
      </div>
      <PasswordPopup
        title="Event entschlüsseln"
        state={{ open: passwordPopupVisible, setOpen: setPasswordPopupVisible }}
        done={onDecryptData}
      />
      <AddEventManagerPopup
        state={{ open: managerPopupVisible, setOpen: setManagerPopupVisible }}
        done={onAddEventManager}
      />
      <ConfirmPopup
        title="Event beenden"
        state={{ open: confirmCompletePopupVisible, setOpen: setConfirmCompletePopupVisible }}
        done={onCompleteEvent}
      />
    </>
  );
};

export default EventPage;
