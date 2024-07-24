"use client";

import { ChangeEvent, Reducer, useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { ToggleButton } from "@/components/ToggleButton";
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

const EventPage = ({ params }: { params: { event_id: string } }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const { getToken } = useToken();
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [passwordPopupVisible, setPasswordPopupVisible] = useState<boolean>(false);
  const [managerPopupVisible, setManagerPopupVisible] = useState<boolean>(false);
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
      <div key={`event-group-${index}`} className="grid grid-cols-subgrid col-span-6 gap-3">
        <div>{group.name ?? "***"}</div>
        <div>{group.category}</div>
        <div>
          <div className="mr-3">{group.contact.FirstName ?? "***"}</div>
          <div>{group.contact.LastName ?? "***"}</div>
        </div>
        <div>
          <ToggleButton
            className="h-6 w-12"
            disabled
            value={group.approved}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              dispatch({ type: "updateApproved", value: e.target.value, index: index });
            }}
          />
        </div>
        <div>{getLocalDateTime(group.createdAt)}</div>
        <div
          className="ml-10 h-fit w-fit rounded-md cursor-pointer"
          onClick={() => {
            router.push(`/${state.id}/${state.groups![index].id}`);
          }}
        >
          <PencilIcon height={20} />
        </div>
      </div>
    );
  };

  return (
    <>
      <Lock isLocked={isEncrypted} openPopup={() => setPasswordPopupVisible(true)} />
      <div className="flex flex-row gap-3">
        <div>Event Name: </div>
        <h3 className="text-base font-semibold">{state?.id}</h3>
      </div>
      <div className="flex flex-row gap-3">
        <div>Beschreibung:</div>
        <div className="text-base font-semibold">{state?.description}</div>
      </div>
      <div className="w-full">
      <div className="grid grid-flow-row auto-rows-min gap-3 justify-items-start overflow-x-scroll md:overflow-x-auto">
        <div className="font-bold col-span-6">Gruppen</div>
        {state.groups!.length > 0 ? (
          <>
            <div>Name</div>
            <div>Kategorie</div>
            <div>Kontakt</div>
            <div>Genehmigt</div>
            <div>Erstellt</div>
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
    </>
  );
};

export default EventPage;
