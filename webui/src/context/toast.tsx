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
      <div className="pointer-events-none fixed -z-50 inset-0">
        <div style={{
          position: "absolute",
          left: "10px",
          bottom: "10px",
          zIndex: 10
        }} 
        className="flex flex-col gap-3">
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
