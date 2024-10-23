import { Category } from "@/models/Category";
import { EventSettings } from "@/models/EventSettings";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

const Context = createContext<[Category[], Dispatch<SetStateAction<Category[]>>]>([
  [],
  () => [],
]);

export const CategoriesProvider = ({ children }: any) => {
  const [categories, setCategories] = useState<Category[]>([]);

  return <Context.Provider value={[categories, setCategories]}>{children}</Context.Provider>;
};

export const useCategories = (): [Category[], Dispatch<SetStateAction<Category[]>>] => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return useContext(Context);
};
