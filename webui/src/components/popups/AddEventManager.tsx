import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { FC, HTMLAttributes, useEffect, useRef, useState } from "react";

export interface AddEventManagerPopupProps extends HTMLAttributes<HTMLElement> {
  state: {
    open: boolean;
    setOpen(b: boolean): void;
  };
  done(email: string): void;
}

export const AddEventManagerPopup: FC<AddEventManagerPopupProps> = (
  props: AddEventManagerPopupProps
) => {
  const cancelButtonRef = useRef(null);

  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!props.state.open) {
      setEmail("");
      setErrors([]);
    }
  }, [props.state.open]);

  const onSubmit = async () => {
    try {
      await props.done(email);
      props.state.setOpen(false);
    } catch (e) {
      setErrors(["Invalid email"]);
    }
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
          setEmail("");
          props.state.setOpen(false);
        }}
        className="relative z-10 focus:outline-none"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-400/30 blur-lg" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl border border-2 dark:border-0 dark:bg-gray-700 bg-gray-400 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle className="text-black dark:text-white text-base font-semibold leading-6">
              Event Manager hinzufügen
            </DialogTitle>
            <div id="form" className="mt-2 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Email"
                className="block w-full rounded-md border-0 py-1.5 px-7 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:outline-none focus:ring-green-600 dark:bg-gray-800 dark:border-0 dark:ring-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>
            <div className="flex flex-row py-3  ">
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
                ref={cancelButtonRef}
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
