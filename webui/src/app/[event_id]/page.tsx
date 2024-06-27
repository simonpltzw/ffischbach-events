"use client";

import { Reducer, useEffect, useReducer, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { ToggleButton } from "@/components/ToggleButton";
import { Group } from "@/models/in/Group";
import { AuthenticationResult } from "@azure/msal-browser";
import { getToken } from "@/services/tokenService";
import { Event } from "@/models/in/Event";
import { getEventById } from "@/services/eventsService";
import { useGroupContext } from "@/context/group";
import { decryptKeyWithPassword } from "@/services/passwordService";
import { PrivateKeyService } from "@/services/privateKeyService";
import { PasswordPopup } from "@/components/popups/PasswordPopup";

const EventPage = ({ params }: { params: { event_id: string } }) => {
  const { instance, accounts } = useMsal();
  const router = useRouter();
  const [passwordPopupVisible, setPasswordPopupVisible] = useState<boolean>(false);
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
    getToken(instance, accounts[0]).then((result: AuthenticationResult | undefined) => {
      if (result) {
        getEventById(result!.accessToken, params.event_id).then((event) => {
          event.groups;

          dispatch({ type: "set", value: event });
        });
      }
    });
  }, []);

  const onDecryptData = async (password: string) => {
    //todo add password
    try {
      const privateKey = decryptKeyWithPassword(state.encryptedPrivateKey, password);
      const key: CryptoKey = await PrivateKeyService.importPrivateKey(privateKey);
  
      state.groups = await Promise.all(
        state.groups!.map(async (group) => {
          const decrypted = await PrivateKeyService.decryptData(key, group.encryptedName!);
          group.name = decrypted;
  
          return group;
        })
      );
  
      dispatch({ type: "decGroups", value: state.groups });
    } catch(e) {
      console.log("joe mama")
      throw new Error("wrong passweord")
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

  const generateGroupEntry = (group: Group, index: number) => {
    return (
      <div key={`event-group-${index}`} className="grid grid-cols-subgrid col-span-6 gap-3">
        <div>{group.name}</div>
        <div>{group.category}</div>
        <div>
          <div className="mr-3">{"undefined"}</div>
          <div>{"undefined"}</div>
        </div>
        <div>
          <ToggleButton index={index} dispatch={dispatch} />
        </div>
        <div>{getLocalDateTime(group.createdAt)}</div>
        <div
          className="ml-10 p-3 bg-gray-700 h-fit w-fit rounded-md cursor-pointer"
          onClick={() => {
            router.push(`/${state.id}/${state.groups![index].id}`);
          }}
        ></div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full mx-auto">
      <div className="flex pt-5 justify-center">
        <div className="flex flex-col gap-10 p-4 bg-gray-600 rounded-md">
          <div className="flex flex-row gap-3">
            <div>Event Name: </div>
            <h3 className="text-base font-semibold">{state?.id}</h3>
          </div>
          <div className="flex flex-row gap-3">
            <div>Beschreibung:</div>
            <div className="text-base font-semibold">{state?.description}</div>
          </div>
          <div className="grid grid-cols-6 gap-3">
            <button
              className="rounded-md bg-blue-600 text-white p-2"
              onClick={() => setPasswordPopupVisible((b) => !b)}
            >
              Entschlüsseln
            </button>
            <div className="font-bold col-span-6">Gruppen</div>
            <div>Name</div>
            <div>Kategorie</div>
            <div>Kontakt</div>
            <div>Genehmigt</div>
            <div>Erstellt</div>

            {state.groups!.map((group: Group, index: number) => generateGroupEntry(group, index))}
          </div>
        </div>
      </div>
      <PasswordPopup
        state={{ open: passwordPopupVisible, setOpen: setPasswordPopupVisible }}
        done={onDecryptData}
      />
    </div>
  );
};

export default EventPage;
