import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ChangeEvent, FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import { Input } from "../Input";
import { Button } from "../Button";

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
            className="w-full max-w-md rounded-xl border border-2 dark:border-0 dark:bg-gray-800 bg-gray-400 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle className="text-base font-semibold leading-6">
              Event Manager hinzufügen
            </DialogTitle>
            <div id="form" className="mt-2 flex flex-col gap-3">
              <Input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>
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
