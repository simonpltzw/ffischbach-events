import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ChangeEvent, FC, HTMLAttributes, useEffect, useRef, useState } from "react";

export interface ConfirmPopupProps extends HTMLAttributes<HTMLElement> {
  state: {
    open: boolean;
    setOpen(b: boolean): void;
  };
  done(): void;
}

export const ConfirmPopup: FC<ConfirmPopupProps> = (props: ConfirmPopupProps) => {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!props.state.open) {
      setErrors([]);
    }
  }, [props.state.open]);

  const onSubmit = async () => {
    await props.done();
      props.state.setOpen(false);
  };

  const generateErrorMessage = (error: string, index: number) => {
    return (
      <label key={`create-error-${index}`} htmlFor="form" className="text-red-500">
        {error}
      </label>
    );
  };

  return (
    <>
      <Dialog
        open={props.state.open}
        onClose={() => {
          props.state.setOpen(false);
        }}
        className="relative z-10 focus:outline-none"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-400/30 blur-lg" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-fit max-w-md rounded-xl border border-2 dark:border-0 bg-gray-400 dark:bg-gray-700 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle className="text-base font-semibold leading-6">Event erstellen</DialogTitle>
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>
            <div className="flex flex-row py-3">
              <button
                type="button"
                className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-semibold shadow-sm mr-3 sm:w-auto"
                onClick={onSubmit}
              >
                Bestätigen
              </button>
              <button
                type="button"
                className="mt-3 w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={() => props.state.setOpen(false)}
              >
                Abbrechen
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
