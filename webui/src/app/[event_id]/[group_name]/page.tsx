"use client";

import { Input } from "@/app/components/Input";
import { GroupEvent, useGroupContext } from "@/context/group";
import { Participant } from "@/models/in/Participant";
import { Disclosure } from "@headlessui/react";
import { ReactNode, useState } from "react";

const GroupPage = ({ params }: { params: { group_name: string } }) => {
  const [groupState, dispatchGroup] = useGroupContext();
  const [participants, setParticipants] = useState<Participant[]>(groupState.participants);
  const [newParticipant, setNewParticipant] = useState<Participant>(
    new Participant(-1, "", false, "")
  );

  const onSubmit = () => {
    //api
  };

  const addParticipant = (event: any) => {
    //api
  };

  const updateParticipants = (index: number, participant: Participant) => {
    const updated = [...participants];
    updated[index] = participant;
    setParticipants(updated);
  };

  const generateParticipants = (): ReactNode[] => {
    return participants.map((p: Participant, i: number) => {
      return (
        <div key={`participant-${i}`} className="flex flex-row gap-3 p-2">
          <Input
            value={p.firstName}
            onChange={(e: any) => {
              p.firstName = e.target.value;
              updateParticipants(i, p);
            }}
          />
          <Input
            value={p.lastName}
            onChange={(e: any) => {
              p.lastName = e.target.value;
              updateParticipants(i, p);
            }}
          />
          <Input
            value={p.birthDate}
            onChange={(e: any) => {
              p.birthDate = e.target.value;
              updateParticipants(i, p);
            }}
          />
          <Input
            value={p.email}
            onChange={(e: any) => {
              p.email = e.target.value;
              updateParticipants(i, p);
            }}
          />
          <Input
            value={p.vip.toString()}
            onChange={(e: any) => {
              p.vip = e.target.value;
              updateParticipants(i, p);
            }}
          />
          <Input value={p.createdAt} />
        </div>
      );
    });
  };

  return (
    <div className="relative w-full h-full mx-auto">
      <div className="flex pt-5 justify-center">
        <div className="flex flex-col gap-10">
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
                value={groupState.contact.firstName}
                title="Vorname"
                placeholder=""
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_firstName, value: e.target.value })
                }
              />
              <Input
                value={groupState.contact.lastName}
                title="Nachname"
                placeholder=""
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_lastName, value: e.target.value })
                }
              />
              {/*insert toggle button*/}
              <Input
                value={groupState.contact.vip.toString() ?? false}
                title="VIP"
                placeholder=""
                type="text"
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_vip, value: e.target.value })
                }
              />
              <Input
                value={groupState.contact.email}
                title="Email"
                placeholder=""
                type="email"
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_email, value: e.target.value })
                }
              />
              <Input
                value={groupState.contact.birthDate}
                title="Geburtsdatum"
                placeholder=""
                type="date"
                onChange={(e: any) =>
                  dispatchGroup({ type: GroupEvent.contact_birthDate, value: e.target.value })
                }
              />
            </div>
          </div>

          <Disclosure>
            <Disclosure.Button>
              <span>Neuer Teilnehmer</span>
            </Disclosure.Button>
            <Disclosure.Panel>
              <div className="ml-10 flex flex-col gap-3">
                <button
                  type="button"
                  className="rounded-md bg-blue-600 text-white p-2"
                  onClick={addParticipant}
                >
                  Teilnehmer hinzufügen
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={newParticipant.firstName}
                    title="Vorname"
                    placeholder=""
                    onChange={(e: any) => {
                      console.log(e.target.value);
                      setNewParticipant((p) => {
                        p.firstName = e.target.value;
                        return { ...p };
                      });
                    }}
                  />
                  <Input
                    value={newParticipant.lastName}
                    title="Nachname"
                    placeholder=""
                    onChange={(e: any) => {
                      setNewParticipant((p) => {
                        p.lastName = e.target.value;
                        return { ...p };
                      });
                    }}
                  />
                  {/*insert toggle button*/}
                  <Input
                    value={newParticipant.vip.toString()}
                    title="VIP"
                    placeholder=""
                    type="text"
                    onChange={(e: any) => {
                      setNewParticipant((p) => {
                        p.vip = e.target.value;
                        return { ...p };
                      });
                    }}
                  />
                  <Input
                    value={newParticipant.email}
                    title="Email"
                    placeholder=""
                    type="email"
                    onChange={(e: any) => {
                      setNewParticipant((p) => {
                        p.email = e.target.value;
                        return { ...p };
                      });
                    }}
                  />
                  <Input
                    value={newParticipant.birthDate}
                    title="Geburtsdatum"
                    placeholder=""
                    type="date"
                    onChange={(e: any) => {
                      setNewParticipant((p) => {
                        p.birthDate = e.target.value;
                        return { ...p };
                      });
                    }}
                  />
                </div>
              </div>
            </Disclosure.Panel>
          </Disclosure>

          {generateParticipants()}

          <button
            type="button"
            className="rounded-md bg-blue-600 text-white p-2 mb-3"
            onClick={onSubmit}
          >
            Gruppe updaten
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
