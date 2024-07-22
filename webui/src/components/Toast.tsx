import { useToast } from "@/context/toast";
import { Toast, ToastType } from "@/models/toast";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { FC, HTMLAttributes } from "react";

const getToastColor = (type: ToastType) => {
  switch (type) {
    case "error":
      return "bg-red-600";
    case "info":
      return "bg-blue-600";
  }
};

export interface ToastProps extends HTMLAttributes<HTMLElement> {
  index: number;
  toast: Toast;
}

export const ToastComponent: FC<ToastProps> = (props: ToastProps) => {
  const {
    state: [, setToastList],
  } = useToast();

  const closeToast = () => {
    setToastList((toastList: Toast[]) =>
      toastList.filter((toast: Toast, index: number) => index != props.index)
    );
  };

  return (
    <div
      className={`absolute right-0 top-0 z-10 mt-20 mr-3 flex flex-row gap-3 items-center rounded-md text-white p-4 
        ${getToastColor(props.toast.type)}`}
    >
      <div>{props.toast.message}</div>
      <XMarkIcon className="cursor-pointer" height={20} onClick={closeToast} />
    </div>
  );
};
