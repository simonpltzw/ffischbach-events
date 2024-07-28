"use client";

import { Button } from "@/components/Button";
import { CheckBox } from "@/components/CheckBox";
import { Input } from "@/components/Input";
import { Lock } from "@/components/Lock";
import { PasswordPopup } from "@/components/popups/PasswordPopup";
import { GroupEvent, useGroupContext } from "@/context/group";
import { useToast } from "@/context/toast";
import { Group } from "@/models/in/Group";
import { Participant } from "@/models/in/Participant";
import { getGroup, updateGroup } from "@/services/groupsService";
import { decryptKeyWithPassword } from "@/services/passwordService";
import { PrivateKeyService } from "@/services/privateKeyService";
import useToken from "@/services/tokenService";
import { ChangeEvent, useEffect, useState } from "react";

const GroupPage = ({ params }: { params: { group_name: string } }) => {
  const [groupState, dispatchGroup] = useGroupContext();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [passwordPopupVisible, setPasswordPopupVisible] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const { getToken } = useToken();
  const { addToast } = useToast();
  const empty = "***";

  useEffect(() => {
    getToken().then((token: string) => {
      getGroup(token, params.group_name).then((group: Group) => {
        dispatchGroup({ type: GroupEvent.new, value: group });
        setParticipants([...group.participants]);
      });
    });
  }, []);

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
        const decryptedParticipant: Participant = JSON.parse(
          await PrivateKeyService.decryptData(key, participant.encryptedData!)
        );

        const adaptedContact: Participant = new Participant(
          participant.id,
          decryptedParticipant.Email,
          decryptedParticipant.FirstName,
          decryptedParticipant.LastName,
          decryptedParticipant.BirthDate,
          participant.vip,
          participant.createdAt
        );

        return adaptedContact;
      })
    );

    dispatchGroup({ type: GroupEvent.contact_new, value: adaptedContact });
    dispatchGroup({ type: GroupEvent.name, value: decryptedName });
    //dispatchGroup({ type: GroupEvent.participants, value: decryptedParticipant });

    setParticipants([...decryptedParticipants]);
    setIsEncrypted(false);
    addToast({ message: "Entschlüsselt", type: "info" });
  };

  const updateParticipants = (index: number, participant: Participant) => {
    const updated = [...participants];
    updated[index] = participant;
    setParticipants(updated);
  };

  return (
    <>
      <Lock isLocked={isEncrypted} openPopup={() => setPasswordPopupVisible(true)} />

      <div className="mt-10">
        <Input
          value={groupState.name ?? empty}
          title="Name"
          placeholder=""
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            dispatchGroup({ type: GroupEvent.name, value: e.target.value })
          }
        />
      </div>
      <select
        value={groupState.category ?? empty}
        className="shadow border rounded w-full py-2 px-3 dark:text-white leading-tight focus:outline-none focus:shadow-outline 
              bg-gray-50 text-black dark:text-white dark:bg-gray-900 dark:border-0 h-10
              dark:border-0 ring-0 block p-2.5 dark:bg-gray-700 dark:bg-gray-900 dark:placeholder-gray-400 dark:text-white dark:focus:ring-0 dark:focus:border-0"
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          dispatchGroup({ type: GroupEvent.category, value: e.target.value })
        }
      >
        <option value="Feuerwehr">Feuerwehr Fischbach</option>
        <option value="Verein">Verein</option>
        <option value="Privat">Privat</option>
      </select>
      <CheckBox
        title="Genehmigt"
        value={groupState.approved ?? false}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          groupState.approved = e.target.value == "true" ? true : false;
        }}
      />

      <div className="flex flex-col gap-3">
        <span className="font-bold">Kontakt</span>
        <div className="grid grid-cols-2 gap-3 ml-5">
          <Input
            value={groupState.contact.FirstName ?? empty}
            title="Vorname"
            placeholder=""
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatchGroup({ type: GroupEvent.contact_firstName, value: e.target.value })
            }
          />
          <Input
            value={groupState.contact.LastName ?? empty}
            title="Nachname"
            placeholder=""
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatchGroup({ type: GroupEvent.contact_lastName, value: e.target.value })
            }
          />
          <Input
            value={groupState.contact.Email ?? empty}
            title="Email"
            placeholder=""
            type="email"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatchGroup({ type: GroupEvent.contact_email, value: e.target.value })
            }
          />
          <Input
            value={groupState.contact.BirthDate ?? ""}
            title="Geburtsdatum"
            placeholder=""
            type="date"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatchGroup({ type: GroupEvent.contact_birthDate, value: e.target.value })
            }
          />
          <CheckBox
            title="VIP"
            value={groupState.contact.vip ?? false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              groupState.contact.vip = e.target.value == "true" ? true : false;
            }}
          />
        </div>
      </div>
      <span className="font-bold">Teilnehmer</span>
      {participants.length > 0 && (
        <div className="grid grid-cols-3 gap-3 ml-5">
          <span className="font-semibold">Vorname</span>
          <span className="font-semibold">Nachname</span>
          <span className="font-semibold">Geburtsdatum</span>

          {participants.map((p: Participant, i: number) => {
            return (
              <div key={`participant-${i}`} className="cursor-pointer col-span-full grid grid-cols-subgrid">
                <Input
                  value={p.FirstName ?? empty}
                  placeholder="***"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    p.FirstName = e.target.value;
                    updateParticipants(i, p);
                  }}
                />
                <Input
                  value={p.LastName ?? empty}
                  placeholder="***"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    p.LastName = e.target.value;
                    updateParticipants(i, p);
                  }}
                />
                <Input
                  type="date"
                  value={p.BirthDate ?? ""}
                  placeholder="***"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    p.BirthDate = e.target.value;
                    updateParticipants(i, p);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
      {!isEncrypted && (
        <Button type="button" onClick={onSubmit}>
          Gruppe updaten
        </Button>
      )}

      <PasswordPopup
        state={{ open: passwordPopupVisible, setOpen: setPasswordPopupVisible }}
        done={onDecryptData}
      />
    </>
  );
};

export default GroupPage;
