"use client";

import { Button } from "@/components/Button";
import { CheckBox } from "@/components/CheckBox";
import { Input } from "@/components/Input";
import { Lock } from "@/components/Lock";
import { PasswordPopup } from "@/components/popups/PasswordPopup";
import { Spinner } from "@/components/Spinner";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table/Table";
import { useCategories } from "@/context/category";
import { useEventSettings } from "@/context/eventSettings";
import { useGroupContext } from "@/context/group";
import { useToast } from "@/context/toast";
import { Category } from "@/models/Category";
import { Group } from "@/models/in/Group";
import { Participant } from "@/models/in/Participant";
import { decryptGroup } from "@/services/decryptService";
import { getEventById } from "@/services/eventsService";
import { getGroup, updateGroup } from "@/services/groupsService";
import useToken from "@/services/tokenService";
import { TrashIcon } from "@heroicons/react/24/solid";
import React, { useLayoutEffect } from "react";
import { ChangeEvent, useEffect, useState } from "react";

const GroupPage = ({ params }: { params: { event_id: string; group_id: string } }) => {
  const [groupState, dispatchGroup] = useGroupContext();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [eventSettings, setEventSetting] = useEventSettings();
  const [participantFilter, setParticipantFilter] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>();
  const { getToken } = useToken();
  const { addToast } = useToast();
  const [categories, setCategories] = useCategories();
  const empty = "***";

  useLayoutEffect(() => {
    params.event_id = decodeURI(params.event_id);

    setIsPending(true);
    getToken().then((token: string) => {
      getGroup(token, parseInt(params.group_id)).then((group: Group) => {
        dispatchGroup({ type: "new", value: group });
        setParticipants([...group.participants]);
        setIsPending(false);

        if (eventSettings && eventSettings.password && eventSettings.eventId == params.event_id) {
          if (group.event) {
            onDecryptEventData(eventSettings.password, false, group);
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (params.event_id != eventSettings.eventId && categories.length == 0) {
      getToken().then((token) =>
        getEventById(token, params.event_id).then((event) => setCategories(event.categories))
      );
    }
  }, [groupState, eventSettings]);

  const onSubmit: any = () => {
    //todo
    groupState.participants = participants;

    getToken().then((token: string) => {
      updateGroup(token, groupState);
      addToast({ message: "Gruppe aktualisiert", type: "info" });

      dispatchGroup({ type: "new", value: groupState });
    });
  };

  const onDecryptEventData = async (password: string, isManual?: boolean, localState?: Group) => {
    if (!localState) {
      localState = groupState;
    }

    const updatedGroup: Group = await decryptGroup(localState, { password });

    dispatchGroup({
      type: "new",
      value: updatedGroup,
    });

    setIsEncrypted(false);

    setEventSetting({ eventId: localState.event?.id, password });
    setParticipants([...updatedGroup.participants]);
    if (isManual) {
      addToast({ message: "Entschlüsselt", type: "info" });
    }
  };

  const updateParticipants = (index: number, participant: Participant) => {
    const updated = [...participants];
    updated[index] = participant;
    setParticipants(updated);
  };

  const deleteParticipant = (id: number) => {
    setParticipants(participants.filter((p: Participant) => p.id != id));
  };

  const generateParticipantList = () => {
    const filteredParticipants = participants
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
          <TR disabled key={`participant-${i}`}>
            <TD>
              <Input
                value={p.FirstName ?? empty}
                className="ml-0"
                disabled={isEncrypted}
                placeholder="***"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  p.FirstName = e.target.value;
                  updateParticipants(i, p);
                }}
              />
            </TD>
            <TD>
              <Input
                disabled={isEncrypted}
                className="ml-0"
                value={p.LastName ?? empty}
                placeholder="***"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  p.LastName = e.target.value;
                  updateParticipants(i, p);
                }}
              />
            </TD>
            <TD>
              <Input
                type="date"
                disabled={isEncrypted}
                className="ml-0"
                value={p.BirthDate ?? ""}
                placeholder="***"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  p.BirthDate = e.target.value;
                  updateParticipants(i, p);
                }}
              />
            </TD>
            <TD>
              <div className="col-auto col-span-1 h-full">
                <Button
                  color="red"
                  type="button"
                  disabled={isEncrypted}
                  onClick={() => deleteParticipant(p.id)}
                >
                  <TrashIcon height={16} />
                </Button>
              </div>
            </TD>
          </TR>
        );
      });

    if (filteredParticipants.length > 0) {
      return filteredParticipants;
    } else {
      return (
        <TR disabled>
          <TD colspan={4}>
            <div className="flex justify-center">
              {isPending ? <Spinner /> : "Keine Einträge gefunden"}
            </div>
          </TD>
        </TR>
      );
    }
  };

  return (
    <>
      <PasswordPopup title="Gruppe entschlüsseln" disabled={!isEncrypted} done={onDecryptEventData}>
        <Lock isLocked={isEncrypted} />
      </PasswordPopup>

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
          value={groupState.category?.id ?? empty}
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
          {categories.map((c) => {
            return (
              <option key={`category-${c.id}`} value={c.id}>
                {c.name}
              </option>
            );
          })}
        </select>
      </div>

      <CheckBox
        title="Genehmigt"
        disabled={isEncrypted}
        value={!!groupState.approved}
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
            value={!!groupState.contact.vip}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              groupState.contact.vip = e.target.checked;
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 shadow pl-3 rounded-lg">
        <div className="flex flex-col gap-4 items-start border dark:border-0 p-3 dark:bg-gray-900/30">
          <label className="text-lg font-semibold">Filter</label>
          <span className="font-bold">Teilnehmer</span>
          <div>
            <Input
              className="w-44"
              type="search"
              title="Teilnehmersuche"
              disabled={isEncrypted}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setParticipantFilter(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <THead>
            <tr>
              <TH>Vorname</TH>
              <TH>Nachname</TH>
              <TH>Geburtsdatum</TH>
              <TH></TH>
            </tr>
          </THead>
          <TBody>{generateParticipantList()}</TBody>
        </Table>
      </div>

      {!isEncrypted && (
        <div className="flex flex-row justify-end">
          <Button color="blue" type="button" onClick={onSubmit}>
            Gruppe updaten
          </Button>
        </div>
      )}
    </>
  );
};

export default GroupPage;
