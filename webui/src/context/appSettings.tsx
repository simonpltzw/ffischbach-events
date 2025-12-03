import { AppSettings } from "@/models/appSettings";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";

const Context = createContext<
  [AppSettings, Dispatch<SetStateAction<AppSettings>>]
>([{ isDarkMode: false }, () => {}]);

export const AppSettingsProvider = ({ children }: any) => {
  const [appSettings, setAppSettings] = useState<AppSettings>({
    isDarkMode: false,
  });

  const onInit = useEffectEvent(() => {
    setAppSettings((state: AppSettings) => {
      const isDarkMode = localStorage.getItem("theme") == "dark" ? true : false;
      return {
        ...state,
        isDarkMode,
      };
    });
  });

  useEffect(() => {
    onInit();
  }, []);

  return (
    <Context.Provider value={[appSettings, setAppSettings]}>
      {children}
    </Context.Provider>
  );
};

export const useAppSettings = (): [
  AppSettings,
  Dispatch<SetStateAction<AppSettings>>,
] => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useAppSettings must be used within a AppSettingsProvider");
  }
  return useContext(Context);
};
