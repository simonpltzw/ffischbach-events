import { useToast } from "@/context/toast";
import { Toast, ToastType } from "@/models/toast";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { FC, HTMLAttributes, useEffect } from "react";

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
  const { removeToast } = useToast();

  useEffect(() => {
    setTimeout(() => {
      removeToast(props.index);
    }, 2500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`absolute opacity-80 left-4 bottom-4 z-10 flex flex-row gap-3 items-center rounded-md text-white p-4 
        ${getToastColor(props.toast.type)}`}
    >
      <div>{props.toast.message}</div>
      <XMarkIcon className="cursor-pointer" height={20} onClick={() => removeToast(props.index)} />
    </div>
  );
};
