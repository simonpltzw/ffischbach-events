import { AppSettings } from "@/models/appSettings";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

const Context = createContext<[AppSettings ,Dispatch<SetStateAction<AppSettings>>]>([{isDarkMode: false}, () => {}]);

export const AppSettingsProvider = ({ children }: any) => { 
    const [appSettings, setAppSettings] = useState<AppSettings>({isDarkMode: false})
  
    return <Context.Provider value={[appSettings, setAppSettings]}>{children}</Context.Provider>;
  };

export const useAppSettings = (): [AppSettings, Dispatch<SetStateAction<AppSettings>>] => {
    const ctx = useContext(Context)
    if(!ctx) {
        throw new Error('useAppSettings must be used within a AppSettingsProvider')
    }
  return useContext(Context);
};
