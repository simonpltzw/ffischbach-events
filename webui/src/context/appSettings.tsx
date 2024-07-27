import { AppSettings } from "@/models/appSettings";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

const Context = createContext<[AppSettings, Dispatch<SetStateAction<AppSettings>>]>([
  { isDarkMode: false },
  () => {},
]);

export const AppSettingsProvider = ({ children }: any) => {
  const [appSettings, setAppSettings] = useState<AppSettings>({ isDarkMode: false });

  useEffect(() => {
    setAppSettings((state: AppSettings) => {
      const isDarkMode = localStorage.getItem("theme") == "dark" ? true : false;
      console.log(isDarkMode);
      return {
        ...state,
        isDarkMode,
      };
    });
  }, []);

  return <Context.Provider value={[appSettings, setAppSettings]}>{children}</Context.Provider>;
};

export const useAppSettings = (): [AppSettings, Dispatch<SetStateAction<AppSettings>>] => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useAppSettings must be used within a AppSettingsProvider");
  }
  return useContext(Context);
};
