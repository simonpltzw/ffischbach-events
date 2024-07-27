import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ChangeEvent, FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import { Input } from "../Input";
import { Button } from "../Button";

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
            className="w-full max-w-md rounded-xl border border-2 dark:border-0 bg-gray-400 dark:bg-gray-800 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle className="text-base font-semibold leading-6">Event erstellen</DialogTitle>
            <form id="form" className="mt-2 flex flex-col gap-3">
              <Input
                type="password"
                placeholder="Passwort"
                autoComplete="current-password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </form>
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>
            <div className="flex flex-row py-3 gap-3">
              <Button type="button" className="bg-green-600" onClick={onSubmit}>
                Bestätigen
              </Button>
              <Button
                type="button"
                className="bg-gray-500 dark:bg-gray-900"
                onClick={() => props.state.setOpen(false)}
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
