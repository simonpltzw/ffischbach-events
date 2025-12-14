"use client";

import { Button } from "@/components/Button";
import { CheckBox } from "@/components/CheckBox";
import { DataList } from "@/components/DataList";
import { Input } from "@/components/Input";
import { Lock } from "@/components/Lock";
import { PasswordPopup } from "@/components/popups/PasswordPopup";
import { Select } from "@/components/Select";
import { TD, TR } from "@/components/table/Table";
import { useCategories } from "@/context/category";
import { useEventSettings } from "@/context/eventSettings";
import { useGroupContext } from "@/context/group";
import { useToast } from "@/context/toast";
import { Category } from "@/models/Category";
import { Group } from "@/models/in/Group";
import { Participant } from "@/models/in/Participant";
import { decryptGroup } from "@/services/decryptService";
import { TrashIcon } from "@heroicons/react/24/solid";
import React, { useMemo } from "react";
import { ChangeEvent, useEffect, useState } from "react";
import { NewParticipant } from "./NewParticipant";
import { Event } from "@/models/in/Event";
import { useEventService } from "@/services/eventsService";
import { useGroupService } from "@/services/groupsService";
import useErrorHandler from "@/services/errorHandler";
import { useParticipantService } from "@/services/participantService";
import { useParams } from "next/navigation";
import { useEmail as useEmail } from "@/services/emailService";

const GroupPage = () => {
  const params = useParams<{ event_id: string; group_id: string }>();
  const [groupState, dispatchGroup] = useGroupContext();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [eventSettings, setEventSetting] = useEventSettings();
  const [participantFilter, setParticipantFilter] = useState<string>("");
  const { getGroup, updateGroup } = useGroupService();
  const [, setIsPending] = useState<boolean>();
  const { addToast } = useToast();
  const { sendApprovalEmail } = useEmail();
  const { getEventById } = useEventService();
  const errorHandler = useErrorHandler();
  const [categories, setCategories] = useCategories();
  const { putEvent } = useEventService();

  /*const [participantToSwap, setParticipantToSwap] = useState<ParticipantEdit | undefined>(
    undefined
  );*/

  const tableHeaders = useMemo(
    () => [
      "Vorname",
      "Nachname",
      "Geburtsdatum",
      // "Kontakt Tauschen",
      "VIP",
      "Löschen",
    ],
    []
  );
  const empty = "***";

  useEffect(() => {
    params.event_id = decodeURI(params.event_id);

    setIsPending(true);
    getGroup(parseInt(params.group_id))
      .then((group: Group) => {
        dispatchGroup({ type: "new", value: group });
        setParticipants([...group.participants]);
        setIsPending(false);

        if (eventSettings && eventSettings.password && eventSettings.eventId == params.event_id) {
          if (group.event) {
            onDecryptEventData(eventSettings.password, false, group);
          }
        }
      })
      .catch((e) => errorHandler(e));

    getEventById(params.event_id)
      .then((event: Event) => setCategories(event.categories))
      .catch((e) => errorHandler(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit: any = () => {
    groupState.participants = participants;

    updateGroup(groupState)
      .then(() => {
        addToast({ message: "Gruppe aktualisiert", type: "info" });

        dispatchGroup({ type: "new", value: groupState });
      })
      .then(() => {
        if (groupState.approved) {
          sendApprovalEmail(groupState).then(() =>
            addToast({
              message: "Genehmigungsbestätigung gesendet",
              type: "info",
            })
          );
        }
      })
      .catch((e) => errorHandler(e));
  };

  const onDecryptEventData = async (password: string, isManual?: boolean, localState?: Group) => {
    if (!localState) {
      localState = groupState;
    }

    const updatedGroup: Group = await decryptGroup(localState, { password });

    if (!updatedGroup.category) {
      updatedGroup.category = categories[0];
    }

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
  /*
  const toggleSwapPopup = (p: Participant) => {
    const editP: ParticipantEdit = {
      id: p.id,
      firstName: p.FirstName,
      lastName: p.LastName,
      email: p.Email,
      birthDate: p.BirthDate,
      groupId: params.group_id,
    };

    setParticipantToSwap(editP);
  };
  */
  /*
  const swapContact = (editP: ParticipantEdit) => {
    addContact(editP)
      .then((p) => {
        if (eventSettings.password && groupState.event?.encryptedPrivateKey) {
          decryptParticipant(p, eventSettings.password, groupState.event.encryptedPrivateKey)
            .then((newP) => {
              let pList: Participant[] = [];

              if (participantToSwap) {
                pList = [
                  ...participants.filter((_p) => _p.id != participantToSwap.id),
                  groupState.contact,
                ];

                setParticipants(pList);
              }

              newP.id = p.id;
              dispatchGroup({ type: "contact_new", value: newP });

              return pList;
            })
            .then(() => {
              //setParticipantToSwap(undefined);
              addToast({ message: "Kontakt getauscht", type: "info" });
            });
        }
      })
      .catch((e) => errorHandler(e));
  };*/

  const generateParticipantList = () => {
    return participants
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
            <TD className="w-1/3">
              <Input
                required
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
            <TD className="w-1/3">
              <Input
                required
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
            <TD className="w-1/3">
              <Input
                required
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
            {/* <TD>
              <div className="col-auto col-span-1 h-full">
                <Button
                  color="red"
                  type="button"
                  disabled={isEncrypted}
                  onClick={() => toggleSwapPopup(p)}
                >
                  <ArrowsRightLeftIcon height={16} />
                </Button>
              </div>
            </TD> */}
            <TD>
              <CheckBox
                value={p.vip}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  p.vip = e.target.checked;
                  updateParticipants(i, p);
                }}
              />
            </TD>
            <TD>
              <div>
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
      <Select
        title="Kategorie"
        disabled={isEncrypted}
        value={groupState.category?.id}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const c: Category | undefined = categories.find((c) => c.id == e.target.value);
          if (c) {
            dispatchGroup({ type: "category", value: c });
          }
        }}
      >
        {categories.map((c) => {
          return (
            <option key={`category-${c.id}`} value={c.id}>
              {c.name}
            </option>
          );
        })}
      </Select>
      <CheckBox
        title="Genehmigt"
        disabled={isEncrypted}
        value={!!groupState.approved}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          dispatchGroup({ type: "approved", value: e.target.checked });
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
              dispatchGroup({ type: "contact_vip", value: e.target.checked });
            }}
          />
        </div>
      </div>

      <DataList
        colSpan={5}
        title="Teilnehmer"
        disabled={isEncrypted}
        filter={participantFilter}
        dispatchCb={(value) => {
          setParticipantFilter(value);
        }}
        generateList={() => generateParticipantList()}
        tableHeaders={tableHeaders}
        createComponent={
          <NewParticipant
            disabled={isEncrypted}
            groupId={params.group_id}
            setParticipants={setParticipants}
            dispatchGroup={dispatchGroup}
            contact={groupState.contact}
            encPrivateKey={groupState.event?.encryptedPrivateKey}
          />
        }
      />
      {!isEncrypted && (
        <div className="flex flex-row justify-end gap-3">
          <Button color="blue" type="button" onClick={onSubmit}>
            Gruppe updaten
          </Button>
        </div>
      )}

      {/*<SwapContactPopup
        isSwap
        disabled={!isEncrypted}
        participant={participantToSwap}
        setParticipant={setParticipantToSwap}
        done={(p) => {
          swapContact(p);
        }}
      ></SwapContactPopup>*/}
    </>
  );
};

export default GroupPage;
