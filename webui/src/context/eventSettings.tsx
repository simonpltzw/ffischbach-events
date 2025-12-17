import { EventSettings } from "@/models/EventSettings";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

const Context = createContext<[EventSettings, Dispatch<SetStateAction<EventSettings>>]>([
  {},
  () => {},
]);

export const EventSettingsProvider = ({ children }: any) => {
  const [eventPassword, setEventPassword] = useState<EventSettings>({});

  return <Context.Provider value={[eventPassword, setEventPassword]}>{children}</Context.Provider>;
};

export const useEventSettings = (): [EventSettings, Dispatch<SetStateAction<EventSettings>>] => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useEventSettings must be used within a PasswordProvider");
  }
  return useContext(Context);
};
