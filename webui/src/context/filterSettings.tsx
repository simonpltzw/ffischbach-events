import { createContext, Dispatch, Reducer, useContext, useReducer } from "react";
import { FilterSettings } from "@/models/FilterSettings";

const Context = createContext<any | undefined>(null);

export type FilterSettingsAction = Action<FilterSettings>


export const FilterSettingsProvider = ({ children }: any) => {
  const filterSettingsReducer = (state: FilterSettings, action: FilterSettingsAction): FilterSettings => {
    return {
      ...state,
      ...action
    }
  };

  const empty: FilterSettings = {
    eventDetail: {
      approved: false,
      groupFilter: ""
    },
    eventList: {
      finished: false,
      eventFilter: ""
    }
  }

  const [filterSettings, dispatchFilterSettings] = useReducer<Reducer<FilterSettings, FilterSettingsAction>>(filterSettingsReducer, empty)

  return <Context.Provider value={[filterSettings, dispatchFilterSettings]}>{children}</Context.Provider>;
};

export const useFilterSettings = (): [FilterSettings, Dispatch<FilterSettingsAction>] => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useFilterSettings must be used within a FilterSettingsProvider");
  }
  return useContext(Context);
};
