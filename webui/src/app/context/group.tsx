import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import { Group } from "../models/in/Group";

const Context = createContext<any | undefined>(null);

export const GroupProvider = ({ children }: any) => {
  const [group, setGroup] = useState<Group | undefined>(undefined);

  return <Context.Provider value={[group, setGroup]}>{children}</Context.Provider>;
};

export const useGroupContext = () => {
    const ctx = useContext(Context)
    if(!ctx) {
        throw new Error('useGroupContext must be used within a GroupProvider')
    }
  return useContext(Context);
};
