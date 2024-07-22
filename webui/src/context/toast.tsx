import { ToastComponent } from "@/components/Toast";
import { Toast } from "@/models/toast";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

type stateType = {
  state: [Toast[], Dispatch<SetStateAction<Toast[]>>];
  addToast(t: Toast): void;
};

const Context = createContext<stateType>({ state: [[], () => {}], addToast: () => {} });

export const ToastProvider = ({ children }: any) => {
  const [toastList, setToastList] = useState<Toast[]>([]);

  const addToast = (newToast: Toast) => {
    console.log("123")
    setToastList([...toastList, newToast]);
  };

  return (
    <Context.Provider value={{state: [toastList, setToastList], addToast}}>
      <div className="relative w-full h-full">
        <>
          {toastList.map((toast: Toast, index: number) => {
            return <ToastComponent key={`toast-${index}`} index={index} toast={toast} />;
          })}
        </>
        {children}
      </div>
    </Context.Provider>
  );
};

export const useToast = (): stateType => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return useContext(Context);
};
