import { useToast } from "@/context/toast";
import { Toast, ToastType } from "@/models/toast";
import { ClipboardDocumentIcon, XMarkIcon } from "@heroicons/react/24/solid";
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
  const { addToast, removeToast } = useToast();

  useEffect(() => {
    if (props.toast.type != "error") {
      setTimeout(() => {
        removeToast(props.index);
      }, 3500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCopy = () => {
    if (props.toast.traceId) {
      navigator.clipboard.writeText(props.toast.traceId).then(() =>
        addToast({
          message: "Trace Id kopiert",
          type: "info",
        })
      );
    }
  };

  return (
    <div
      className={`opacity-90 flex flex-row w-fit gap-3 items-center rounded-md text-white p-4 
        ${getToastColor(props.toast.type)}`}
    >
      {props.toast.traceId && (
        <ClipboardDocumentIcon className="cursor-pointer" onClick={onCopy} height={25} />
      )}
      <div className="text-nowrap">{props.toast.message}</div>
      <XMarkIcon className="cursor-pointer" height={20} onClick={() => removeToast(props.index)} />
    </div>
  );
};
