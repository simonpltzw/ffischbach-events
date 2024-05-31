"use client";

import { Input } from "@/app/components/Input";
import { ToggleButton } from "@/app/components/ToggleButton";
import { useGroupContext } from "@/app/context/group";
import { clone, Group } from "@/app/models/in/Group";
import { Participant } from "@/app/models/in/Participant";
import { updateEvent } from "@/app/services/eventsService";
import { useContext, useEffect, useReducer } from "react";

enum Event {
  name,
  category,
  approved,
  contact_email,
  contact_firstName,
  contact_lastName,
  contact_birthDate,
  contact_vip,
}

const GroupPage = ({ params }: { params: { group_name: string } }) => {
  const reducer = (state: Group, action: any): Group => {
    const event = action.type as Event

    const newState = {...state}

    switch (event) {
      case Event.name:
        newState.name = action.value;
        break;
      case Event.category:
        newState.category = action.value;
        break;
      case Event.approved:
        newState.approved = action.value;
        break;
      case Event.contact_email:
        newState.contact.email = action.value;
        break;
      case Event.contact_firstName:
        newState.contact.firstName = action.value;
        break;
      case Event.contact_lastName:
        newState.contact.lastName = action.value;
        break;
      case Event.contact_birthDate:
        newState.contact.birthDate = action.value;
        break;
      case Event.contact_vip:
        newState.contact.vip = action.value;
        break;
    }
    return newState;
  };

  const [group, setGroup] = useGroupContext();

  const [state, dispatch] = useReducer(reducer, {...group});
  //todo add reducer for participant list

  useEffect(() => console.log(state), [state]);

  const onSubmit = () => {
    setGroup(state);
    //updateEvent(state) // or update group?
  };

  return (
    <div className="relative w-full h-full mx-auto">
      <div className="flex pt-5 justify-center">
        <div className="flex flex-col gap-10">
          <Input
            value={state.name}
            title="Name"
            placeholder=""
            onChange={(e: any) => dispatch({ type: Event.name, value: e.target.value })}
          />
          <select
            title="1"
            value={state.category}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(e: any) => dispatch({ type: Event.category, value: e.target.value })}
          >
            <option value="feuerwehr">
              Feuerwehr Fischbach
            </option>
            <option value="verein">Verein</option>
            <option value="privat">Privat</option>
          </select>
          <div className="ml-10 flex flex-col gap-3">
            <span>Kontakt</span>
            <div className="grid grid-cols-2 gap-3"> 
            <Input
              value={state.contact.firstName}
              title="Vorname"
              placeholder=""
              onChange={(e: any) => dispatch({ type: Event.contact_firstName, value: e.target.value })}
            />
            <Input
              value={state.contact.lastName }
              title="Nachname"
              placeholder=""
              onChange={(e: any) => dispatch({ type: Event.contact_lastName, value: e.target.value })}
            />
            <Input
              value={state.contact.vip.toString() ?? false}
              title="VIP"
              placeholder=""
              type="text"
              onChange={(e: any) => dispatch({ type: Event.contact_vip, value: e.target.value })}
            />
            <Input
              value={state.contact.email}
              title="Email"
              placeholder=""
              type="email"
              onChange={(e: any) => dispatch({ type: Event.contact_email, value: e.target.value })}
            />
            <Input
              value={state.contact.birthDate}
              title="Geburtsdatum"
              placeholder=""
              type="date"
              onChange={(e: any) => dispatch({ type: Event.contact_birthDate, value: e.target.value })}
            />
            </div>

          </div>
          {/* participant list */}
          <button type="button" className="rounded-md bg-blue-600 text-white p-2" onClick={onSubmit}>
            Update Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
