import {
  createContext,
  Dispatch,
  Reducer,
  useContext,
  useReducer,
} from "react";
import { Group } from "../models/in/Group";
import { Participant } from "../models/in/Participant";

const Context = createContext<any | undefined>(null);

export enum GroupEvent {
  new,
  name,
  category,
  approved,
  contact_new,
  contact_email,
  contact_firstName,
  contact_lastName,
  contact_birthDate,
  contact_vip,
  participants,
}
export interface GroupAction {
  type: GroupEvent;
  value: any;
}

export const GroupProvider = ({ children }: any) => {
  const groupReducer = (state: Group, action: GroupAction): Group => {
    const newState = { ...state }!;

    switch (action.type) {
      case GroupEvent.new:
        return action.value;
      case GroupEvent.name:
        newState.name = action.value;
        break;
      case GroupEvent.category:
        newState.category = action.value;
        break;
      case GroupEvent.approved:
        newState.approved = action.value;
        break;
      case GroupEvent.contact_new:
        newState.contact = action.value;
        break;
      case GroupEvent.contact_email:
        newState.contact!.Email = action.value;
        break;
      case GroupEvent.contact_firstName:
        newState.contact!.FirstName = action.value;
        break;
      case GroupEvent.contact_lastName:
        newState.contact!.LastName = action.value;
        break;
      case GroupEvent.contact_birthDate:
        newState.contact!.BirthDate = action.value;
        break;
      case GroupEvent.contact_vip:
        newState.contact!.vip = action.value;
        break;
      case GroupEvent.participants:
        newState.participants = action.value;
    }
    return newState;
  };

  const [groupState, dispatchGroup] = useReducer<Reducer<Group, GroupAction>>(
    groupReducer,
    new Group(-1, "", "", "", false, new Participant(-1, "", "", "", "", false, ""), [], "", "")
  );

  return <Context.Provider value={[groupState, dispatchGroup]}>{children}</Context.Provider>;
};

export const useGroupContext = (): [Group, Dispatch<GroupAction>] => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useGroupContext must be used within a GroupProvider");
  }
  return useContext(Context);
};
