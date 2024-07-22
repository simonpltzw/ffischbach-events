import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import { Input } from "../Input";

export interface PasswordPopupProps extends HTMLAttributes<HTMLElement> {
  state: {
    open: boolean;
    setOpen(b: boolean): void;
  };
  done(password: string): Promise<void>;
}

export const PasswordPopup: FC<PasswordPopupProps> = (props: PasswordPopupProps) => {
  const cancelButtonRef = useRef(null);

  const [password, setPassword] = useState<string>("");

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!props.state.open) {
      setPassword("");
      setErrors([]);
    }
  }, [props.state.open]);

  const onSubmit = async () => {
    try {
      await props.done(password);
      props.state.setOpen(false);
    } catch (e) {
      setErrors(["Wrong password"]);
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
          setPassword("");
          props.state.setOpen(false);
        }}
        className="relative z-10 focus:outline-none"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-400/30 blur-lg" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl border border-2 dark:border-0 bg-gray-400 dark:bg-gray-700 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle className="text-base font-semibold leading-6">Event erstellen</DialogTitle>
            <form id="form" className="mt-2 flex flex-col gap-3">
              <Input
                type="password"
                placeholder="Passwort"
                autoComplete="current-password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
              />
            </form>
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>
            <div className="flex flex-row py-3">
              <button
                type="button"
                className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-red-500 mr-3 sm:w-auto"
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
