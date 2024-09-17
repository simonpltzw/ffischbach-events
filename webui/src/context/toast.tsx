import { ToastComponent } from "@/components/Toast";
import { Toast } from "@/models/toast";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

type stateType = {
  state: [Toast[], Dispatch<SetStateAction<Toast[]>>];
  addToast(t: Toast): void;
  removeToast(i: number): void;
};

const Context = createContext<stateType>({
  state: [[], () => {}],
  addToast: () => {},
  removeToast: () => {},
});

export const ToastProvider = ({ children }: any) => {
  const [toastList, setToastList] = useState<Toast[]>([]);

  const removeToast = (index: number) => {
    setToastList((toastList: Toast[]) => toastList.filter((toast: Toast, i: number) => index != i));
  };

  const addToast = (newToast: Toast) => {
    setToastList((list) => [...list, newToast]);
  };

  return (
    <Context.Provider value={{ state: [toastList, setToastList], addToast, removeToast }}>
      <div className="relative w-full h-screen overscroll-none">
        <div className="absolute left-4 bottom-4 z-10 flex flex-col gap-3">
          {toastList.map((toast: Toast, index: number) => {
            return <ToastComponent key={`toast-${index}`} index={index} toast={toast} />;
          })}
        </div>

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
