import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Dispatch, FC, HTMLAttributes, ReactNode, SetStateAction } from "react";

export interface PopupPanelProps extends HTMLAttributes<HTMLDivElement> {}

export interface PopupTitleProps extends HTMLAttributes<HTMLDivElement> {}

export interface PopupOpenerProps extends HTMLAttributes<HTMLDivElement> {}
export interface PopupProps extends HTMLAttributes<HTMLDivElement> {
  onClose?(): void;
  state: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
  };
}

export const PopupBackdrop = () => {
  return <DialogBackdrop className="fixed z-0 inset-0 bg-gray-400/30 blur-lg" />;
};

export const PopupDialogPanel: FC<PopupPanelProps> = (props: PopupPanelProps) => {
  return (
    <DialogPanel
      transition
      className="z-50 w-fit max-w-md rounded-xl border border-2 dark:border-0 bg-gray-400 dark:bg-gray-800 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
    >
      {props.children}
    </DialogPanel>
  );
};

export const PopupTitle: FC<PopupTitleProps> = (props: PopupTitleProps) => {
  return <DialogTitle className="text-base text-black dark:text-white  font-semibold leading-6">{props.children}</DialogTitle>;
};

export const PopupOpener: FC<PopupOpenerProps> = (props: PopupOpenerProps) => {
  return <div onClick={props.onClick}>{props.children}</div>
}

export const Popup: FC<PopupProps> = (props: PopupProps) => {
  return (
    <>
    <Dialog
      open={props.state.open}
      onClose={() => {
        if (!!props.onClose) {
          props.onClose();
        }
        props.state.setOpen(false);
      }}
      className="relative z-10 focus:outline-none"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        {props.children}
      </div>
    </Dialog>
    </>
  );
};
