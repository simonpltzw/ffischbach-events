"use client";

import { Reducer, useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { Group } from "@/models/in/Group";
import { Event } from "@/models/in/Event";
import { addEventManager, getEventById, setEventCompleted } from "@/services/eventsService";
import { decryptKeyWithPassword } from "@/services/passwordService";
import { PrivateKeyService } from "@/services/privateKeyService";
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

const EventPage = ({ params }: { params: { event_id: string } }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const { getToken } = useToken();
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [passwordPopupVisible, setPasswordPopupVisible] = useState<boolean>(false);
  const [managerPopupVisible, setManagerPopupVisible] = useState<boolean>(false);
  const [confirmCompletePopupVisible, setConfirmCompletePopupVisible] = useState<boolean>(false);
  const [state, dispatch] = useReducer<Reducer<Event, any>>((state: Event, action: any): any => {
    if (action.type === "updateApproved") {
      const groups: Group[] = state.groups!;
      groups[action.index].approved = action.value;
    } else if (action.type === "set") {
      return action.value;
    } else if (action.type === "decGroups") {
      state.groups = action.value;
      return { ...state };
    }

    return state;
  }, new Event("", "", "", 1, 1, false, "", "", "", []));

  useEffect(() => {
    getToken().then((token: string) => {
      if (token) {
        getEventById(token, params.event_id).then((event) => {
          event.groups;

          dispatch({ type: "set", value: event });
        });
      }
    });
  }, []);

  const onCompleteEvent = () => {
    getToken().then((token: string) => {
      setEventCompleted(token, params.event_id);
      addToast({ message: "Event beendet", type: "info" });
    });
  };

  const onDecryptData = async (password: string) => {
    //todo add password
    try {
      const privateKey = decryptKeyWithPassword(state.encryptedPrivateKey, password);
      const key: CryptoKey = await PrivateKeyService.importPrivateKey(privateKey);

      state.groups = await Promise.all(
        state.groups!.map(async (group) => {
          const decryptedGroupName = await PrivateKeyService.decryptData(key, group.encryptedName!);
          group.name = decryptedGroupName;

          const decryptedContactJson = await PrivateKeyService.decryptData(
            key,
            group.contact.encryptedData!
          );
          const decryptedContact = JSON.parse(decryptedContactJson);
          group.contact = decryptedContact;

          return group;
        })
      );

      dispatch({ type: "decGroups", value: state.groups });
      setIsEncrypted(false);
      addToast({ message: "Entschlüsselt", type: "info" });
    } catch (e) {
      throw new Error("Wrong password");
    }
  };

  const getLocalDateTime = (dateStr: string): string => {
    const date: Date = new Date(dateStr);
    return `${date.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const onAddEventManager = async (email: string) => {
    const token = await getToken();
    await addEventManager(token, params.event_id, email);
  };

  const generateGroupEntry = (group: Group, index: number) => {
    return (
      <div
        key={`event-group-${index}`}
        className="grid grid-cols-subgrid justify-items-start place-items-center col-span-6 gap-3 px-3 py-2 border dark:border-0 dark:bg-gray-900 rounded"
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

  return (
    <>
      {state.completed && <InfoBadge text="Event ist beendet" />}
      <Lock isLocked={isEncrypted} openPopup={() => setPasswordPopupVisible(true)} />
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
        </div>
      )}
      <div className="w-full">
        <div className="grid grid-flow-row auto-rows-min gap-3 justify-items-start overflow-x-scroll md:overflow-x-auto">
          <div className="font-extrabold col-span-6 mb-3">Gruppen</div>
          {state.groups!.length > 0 ? (
            <>
              <div className="font-bold">Name</div>
              <div className="font-bold">Kategorie</div>
              <div className="font-bold">Kontakt</div>
              <div className="font-bold">Genehmigt</div>
              <div className="font-bold">Erstellt</div>
              <div></div>

              {state.groups!.map((group: Group, index: number) => generateGroupEntry(group, index))}
            </>
          ) : (
            <span>Leer</span>
          )}
        </div>
      </div>
      <PasswordPopup
        state={{ open: passwordPopupVisible, setOpen: setPasswordPopupVisible }}
        done={onDecryptData}
      />
      <AddEventManagerPopup
        state={{ open: managerPopupVisible, setOpen: setManagerPopupVisible }}
        done={onAddEventManager}
      />
      <ConfirmPopup
        state={{ open: confirmCompletePopupVisible, setOpen: setConfirmCompletePopupVisible }}
        done={onCompleteEvent}
      />
    </>
  );
};

export default EventPage;
