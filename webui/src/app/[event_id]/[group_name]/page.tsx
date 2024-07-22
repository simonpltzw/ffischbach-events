"use client";

import { Input } from "@/components/Input";
import { PasswordPopup } from "@/components/popups/PasswordPopup";
import { GroupEvent, useGroupContext } from "@/context/group";
import { useToast } from "@/context/toast";
import { Group } from "@/models/in/Group";
import { Participant } from "@/models/in/Participant";
import { getGroup, updateGroup } from "@/services/groupsService";
import { decryptKeyWithPassword } from "@/services/passwordService";
import { PrivateKeyService } from "@/services/privateKeyService";
import useToken from "@/services/tokenService";
import { useEffect, useState } from "react";

const GroupPage = ({ params }: { params: { group_name: string } }) => {
  const [groupState, dispatchGroup] = useGroupContext();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [passwordPopupVisible, setPasswordPopupVisible] = useState<boolean>(false);
  const { addToast } = useToast();

  useEffect(() => {
    getToken().then((token: string) => {
      getGroup(token, params.group_name).then((group: Group) => {
        dispatchGroup({ type: GroupEvent.new, value: group });
        setParticipants([...group.participants]);
      });
    });
  }, []);

  useEffect(() => console.log(groupState.category))

  const onSubmit = () => {
    //todo
    groupState.participants = participants;

    getToken().then((token: string) => {
      updateGroup(token, groupState);
      addToast({ message: "Gruppe aktualisiert", type: "info" });

      dispatchGroup({ type: GroupEvent.new, value: groupState });
    });
  };

  const onDecryptData = async (password: string) => {
    const privateKey = decryptKeyWithPassword(groupState.event!.encryptedPrivateKey, password);
    const key: CryptoKey = await PrivateKeyService.importPrivateKey(privateKey);

    const decryptedName = await PrivateKeyService.decryptData(key, groupState.encryptedName!);

    const contact = groupState.contact;
    const decryptedContact = JSON.parse(
      await PrivateKeyService.decryptData(key, groupState.contact.encryptedData!)
    ) as Participant;

    const adaptedContact: Participant = new Participant(
      contact.id,
      decryptedContact.Email,
      decryptedContact.FirstName,
      decryptedContact.LastName,
      decryptedContact.BirthDate,
      contact.vip,
      contact.createdAt
    );

    const decryptedParticipants = await Promise.all(
      groupState.participants.map(async (participant: Participant) => {
        const decryptedParticipant: Participant = JSON.parse(await PrivateKeyService.decryptData(key, participant.encryptedData!));

        const adaptedContact: Participant = new Participant(
          participant.id,
          decryptedParticipant.Email,
          decryptedParticipant.FirstName,
          decryptedParticipant.LastName,
          decryptedParticipant.BirthDate,
          participant.vip,
          participant.createdAt
        );

        return adaptedContact
      })
    );

    dispatchGroup({ type: GroupEvent.contact_new, value: adaptedContact });
    dispatchGroup({ type: GroupEvent.name, value: decryptedName });
    //dispatchGroup({ type: GroupEvent.participants, value: decryptedParticipant });

    setParticipants([...decryptedParticipants]);
    addToast({ message: "Entschlüsselt", type: "info" });
  };

  const updateParticipants = (index: number, participant: Participant) => {
    const updated = [...participants];
    updated[index] = participant;
    setParticipants(updated);
  };

  return (
    <div className="relative w-full h-full mx-auto">
      <div className="flex pt-5 justify-center">
        <div className="flex flex-col gap-10">
          <button className="rounded-md bg-blue-600 text-white p-2" onClick={() => setPasswordPopupVisible(true)}>
            Entschlüsseln
          </button>
          <Input
            value={groupState.name}
            title="Name"
            placeholder=""
            onChange={(e: any) => dispatchGroup({ type: GroupEvent.name, value: e.target.value })}
          />
          <select
            title="1"
            value={groupState.category}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(e: any) =>
              dispatchGroup({ type: GroupEvent.category, value: e.target.value })
            }
          >
            <option value="feuerwehr">Feuerwehr Fischbach</option>
            <option value="verein">Verein</option>
            <option value="privat">Privat</option>
          </select>
          <div className="ml-10 flex flex-col gap-3">
            <span>Kontakt</span>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={groupState.contact.FirstName}
                title="Vorname"
                placeholder=""
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_firstName, value: e.target.value })
                }
              />
              <Input
                value={groupState.contact.LastName}
                title="Nachname"
                placeholder=""
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_lastName, value: e.target.value })
                }
              />
              {/*insert toggle button*/}
              <Input
                //value={groupState.contact.vip.toString() ?? false}
                title="VIP"
                placeholder=""
                type="text"
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_vip, value: e.target.value })
                }
              />
              <Input
                value={groupState.contact.Email}
                title="Email"
                placeholder=""
                type="email"
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_email, value: e.target.value })
                }
              />
              <Input
                value={groupState.contact.BirthDate}
                title="Geburtsdatum"
                placeholder=""
                type="date"
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_birthDate, value: e.target.value })
                }
              />
            </div>
          </div>

          {participants.map((p: Participant, i: number) => {
            return (
              <div key={`participant-${i}`} className="flex flex-row gap-3 p-2">
                <Input
                  value={p.FirstName}
                  placeholder="***"
                  onChange={(e: any) => {
                    p.FirstName = e.target.value;
                    updateParticipants(i, p);
                  }}
                />
                <Input
                  value={p.LastName}
                  placeholder="***"
                  onChange={(e: any) => {
                    p.LastName = e.target.value;
                    updateParticipants(i, p);
                  }}
                />
                <Input
                  value={p.BirthDate}
                  placeholder="***"
                  onChange={(e: any) => {
                    p.BirthDate = e.target.value;
                    updateParticipants(i, p);
                  }}
                />
              </div>
            );
          })}

          <button
            type="button"
            className="rounded-md bg-blue-600 text-white p-2 mb-3"
            onClick={onSubmit}
          >
            Gruppe updaten
          </button>
        </div>
      </div>
      <PasswordPopup
        state={{ open: passwordPopupVisible, setOpen: setPasswordPopupVisible }}
        done={onDecryptData}
      />
    </div>
  );
};

export default GroupPage;
