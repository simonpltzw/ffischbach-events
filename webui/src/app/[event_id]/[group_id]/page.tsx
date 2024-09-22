"use client";

import { Button } from "@/components/Button";
import { CheckBox } from "@/components/CheckBox";
import { Input } from "@/components/Input";
import { Lock } from "@/components/Lock";
import { PasswordPopup } from "@/components/popups/PasswordPopup";
import { useEventSettings } from "@/context/eventSettingsContext";
import { useGroupContext } from "@/context/group";
import { useToast } from "@/context/toast";
import { Group } from "@/models/in/Group";
import { Participant } from "@/models/in/Participant";
import { decryptGroup } from "@/services/decryptService";
import { getGroup, updateGroup } from "@/services/groupsService";
import useToken from "@/services/tokenService";
import { MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/solid";
import { ChangeEvent, Fragment, useEffect, useState } from "react";

const GroupPage = ({ params }: { params: { event_id: string; group_id: string } }) => {
  const [groupState, dispatchGroup] = useGroupContext();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [passwordPopupVisible, setPasswordPopupVisible] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [eventSettings, setEventSetting] = useEventSettings();
  const [participantFilter, setParticipantFilter] = useState<string>("");
  const { getToken } = useToken();
  const { addToast } = useToast();
  const empty = "***";

  useEffect(() => {
    getToken().then((token: string) => {
      getGroup(token, parseInt(params.group_id)).then((group: Group) => {
        dispatchGroup({ type: "new", value: group });
        setParticipants([...group.participants]);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    //objectId as indicator for initial object

    if (
      eventSettings &&
      eventSettings.password &&
      eventSettings.eventId == params.event_id &&
      !!!groupState.name &&
      isEncrypted
    ) {
      if (groupState.event) {
        onDecryptData(eventSettings.password);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupState]);

  const onSubmit = () => {
    //todo
    groupState.participants = participants;

    getToken().then((token: string) => {
      updateGroup(token, groupState);
      addToast({ message: "Gruppe aktualisiert", type: "info" });

      dispatchGroup({ type: "new", value: groupState });
    });
  };

  const onDecryptData = async (password: string) => {
    const updatedGroup: Group = await decryptGroup(groupState, { password });

    dispatchGroup({
      type: "new",
      value: updatedGroup,
    });

    setIsEncrypted(false);

    setEventSetting({ eventId: groupState.event?.id, password });
    setParticipants([...updatedGroup.participants]);
    addToast({ message: "Entschlüsselt", type: "info" });
  };

  const updateParticipants = (index: number, participant: Participant) => {
    const updated = [...participants];
    updated[index] = participant;
    setParticipants(updated);
  };

  const deleteParticipant = (id: number) => {
    setParticipants(participants.filter((p: Participant) => p.id != id));
  };

  return (
    <>
      <Lock isLocked={isEncrypted} openPopup={() => setPasswordPopupVisible(true)} />

      <div className="mb-3 font-bold text-xl">Gruppe bearbeiten</div>
      <Input
        value={groupState.name ?? empty}
        disabled={isEncrypted}
        title="Name"
        placeholder=""
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          dispatchGroup({ type: "name", value: e.target.value })
        }
      />
      <div>
        <div className="block text-sm font-semibold h-fit mb-2">Kategorie</div>
        <select
          value={groupState.category ?? empty}
          disabled={isEncrypted}
          className={`shadow-md border rounded w-full py-2 px-3 dark:text-white leading-tight outline-none 
               focus:border-2 focus:border-blue-500 dark:focus:border-2 dark:focus:border-blue-500
               text-black dark:text-white dark:border-0 h-10
               block p-2.5 dark:placeholder-gray-400 dark:text-white ${
                 isEncrypted ? "bg-gray-200 dark:bg-gray-700/70" : "bg-white dark:bg-gray-900"
               }`}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            dispatchGroup({ type: "category", value: e.target.value })
          }
        >
          <option value="Feuerwehr">Feuerwehr Fischbach</option>
          <option value="Verein">Verein</option>
          <option value="Privat">Privat</option>
        </select>
      </div>

      <CheckBox
        title="Genehmigt"
        disabled={isEncrypted}
        value={groupState.approved ?? false}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          groupState.approved = e.target.checked;
        }}
      />

      <div className="flex flex-col gap-3">
        <span className="font-bold">Kontakt</span>
        <div className="grid grid-cols-2 gap-3 ml-5">
          <Input
            value={groupState.contact.FirstName ?? empty}
            disabled={isEncrypted}
            title="Vorname"
            placeholder=""
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatchGroup({ type: "contact_firstName", value: e.target.value })
            }
          />
          <Input
            value={groupState.contact.LastName ?? empty}
            disabled={isEncrypted}
            title="Nachname"
            placeholder=""
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatchGroup({ type: "contact_lastName", value: e.target.value })
            }
          />
          <Input
            value={groupState.contact.Email ?? empty}
            disabled={isEncrypted}
            title="Email"
            placeholder=""
            type="email"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatchGroup({ type: "contact_email", value: e.target.value })
            }
          />
          <Input
            value={groupState.contact.BirthDate ?? ""}
            disabled={isEncrypted}
            title="Geburtsdatum"
            placeholder=""
            type="date"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatchGroup({ type: "contact_birthDate", value: e.target.value })
            }
          />
          <CheckBox
            title="VIP"
            disabled={isEncrypted}
            value={groupState.contact.vip ?? false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              groupState.contact.vip = e.target.checked;
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 border dark:border-0 dark:bg-gray-900/40 shadow p-3 rounded-lg">
        <div className="flex flex-col gap-4 items-start">
          <label className="text-lg font-semibold">Filter</label>
          <span className="font-bold">Teilnehmer</span>
          {participants.length > 0 && (
            <div>
              <Input
                className="w-44"
                type="search"
                placeholder="Suche"
                disabled={isEncrypted}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setParticipantFilter(e.target.value)
                }
              />
            </div>
          )}
        </div>
        {participants.length > 0 ? (
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start">
            <span className="font-semibold">Vorname</span>
            <span className="font-semibold">Nachname</span>
            <span className="font-semibold">Geburtsdatum</span>
            <span></span>

            {participants
              .filter((p: Participant) => {
                if (!isEncrypted && p.FirstName) {
                  return (
                    p.FirstName.includes(participantFilter) ||
                    p.LastName.includes(participantFilter) ||
                    participantFilter == ""
                  );
                }
                return true;
              })
              .map((p: Participant, i: number) => {
                return (
                  <Fragment key={`participant-${i}`}>
                    <Input
                      className="col-span-1"
                      value={p.FirstName ?? empty}
                      disabled={isEncrypted}
                      placeholder="***"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        p.FirstName = e.target.value;
                        updateParticipants(i, p);
                      }}
                    />
                    <Input
                      className="col-span-1"
                      disabled={isEncrypted}
                      value={p.LastName ?? empty}
                      placeholder="***"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        p.LastName = e.target.value;
                        updateParticipants(i, p);
                      }}
                    />
                    <Input
                      className="col-span-1"
                      type="date"
                      disabled={isEncrypted}
                      value={p.BirthDate ?? ""}
                      placeholder="***"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        p.BirthDate = e.target.value;
                        updateParticipants(i, p);
                      }}
                    />
                    <div className="col-auto col-span-1 h-full">
                      <Button
                        type="button"
                        disabled={isEncrypted}
                        colorstyle="bg-red-600 hover:bg-red-700 hover:dark:bg-red-400"
                        onClick={() => deleteParticipant(p.id)}
                      >
                        <TrashIcon height={16} />
                      </Button>
                    </div>
                  </Fragment>
                );
              })}
          </div>
        ) : (
          <span>Leer</span>
        )}
      </div>

      {!isEncrypted && (
        <Button type="button" onClick={onSubmit}>
          Gruppe updaten
        </Button>
      )}
      <PasswordPopup
        title="Gruppe entschlüsseln"
        state={{ open: passwordPopupVisible, setOpen: setPasswordPopupVisible }}
        done={onDecryptData}
      />
    </>
  );
};

export default GroupPage;
