import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

const Context = createContext<any | undefined>(null);

export const NavigationProvider = ({ children }: any) => { 
    const [location, setLocation] = useState<number>(0);
  
  
    return <Context.Provider value={[location, setLocation]}>{children}</Context.Provider>;
  };

export const useNavigation = (): [number, Dispatch<SetStateAction<number>>] => {
    const ctx = useContext(Context)
    if(!ctx) {
        throw new Error('useNavigation must be used within a NavigationProvider')
    }
  return useContext(Context);
};
