import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { FC, HTMLAttributes, useEffect, useState } from "react";
import { Button } from "../Button";

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
            className="w-fit max-w-md rounded-xl border border-2 dark:border-0 bg-gray-400 dark:bg-gray-800 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle className="text-base font-semibold leading-6">Event erstellen</DialogTitle>
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>

            <div className="flex flex-row gap-3 py-3">
              <Button type="button" onClick={onSubmit} className="bg-green-600">
                Bestätigen
              </Button>
              <Button
                type="button"
                onClick={() => props.state.setOpen(false)}
                className="bg-gray-500 dark:bg-gray-900"
              >
                Abbrechen
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
