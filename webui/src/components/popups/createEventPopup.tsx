import { Event } from "@/models/in/Event";
import { EventOut } from "@/models/out/EventOut";
import { createEvent } from "@/services/eventsService";
import { encryptWithPassword } from "@/services/passwordService";
import useToken from "@/services/tokenService";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { AxiosResponse } from "axios";
import { FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import { Input } from "../Input";

export interface CreateEventPopupProps extends HTMLAttributes<HTMLElement> {
  state: {
    open: boolean;
    setOpen(b: boolean): void;
  };
  done(event: Event): void;
}

export const CreateEventPopup: FC<CreateEventPopupProps> = (props: CreateEventPopupProps) => {
  const cancelButtonRef = useRef(null);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [errors, setErrors] = useState<string[]>([]);
  const { getToken } = useToken();

  useEffect(() => {
    if (!props.state.open) {
      setName("");
      setDescription("");
      setErrors([]);
    }
  }, [props.state.open]);

  const onSubmit = async () => {
    getToken().then((token: string) => {
      encryptWithPassword(password).then(({ encryptedPrivateKey, publicKey }) => {
        const newEvent: EventOut = {
          id: `${name}${new Date().getFullYear()}`,
          description: description,
          encryptedPrivateKey,
          publicKey,
        };

        createEvent(token, newEvent)
          .then((r: AxiosResponse) => {
            props.done(r.data);
            props.state.setOpen(false);
          })
          .catch((error: any) => {
            const errors: any = error.response?.data.errors;
            for (let key in errors) {
              for (let error of errors[key]) {
                setErrors((errors: string[]) => [...errors, error]);
              }
            }
            //setError()
          });
      });
    });
  };

  const generateErrorMessage = (error: string, index: number) => {
    return (
      <label key={`create-error-${index}`} htmlFor="form" className="text-red-500">
        {error}
      </label>
    );
  };

  return (
    <Dialog
      open={props.state.open}
      className="relative z-10 focus:outline-none"
      initialFocus={cancelButtonRef}
      onClose={props.state.setOpen}
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-400/30 blur-lg" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md border border-2 dark:border-0 rounded-xl bg-gray-400 dark:bg-gray-800 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
        >
          <DialogTitle className="text-base font-semibold leading-6">Event erstellen</DialogTitle>
          <div id="form" className="mt-2 flex flex-col gap-3">
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Beschreibung"
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            {errors.map((error: string, index: number) => {
              return generateErrorMessage(error, index);
            })}
          </div>
          <div className="flex flex-row gap-3 py-3">
            <button
              type="button"
              className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-semibold shadow-sm mr-3 sm:w-auto"
              onClick={onSubmit}
            >
              Bestätigen
            </button>
            <button
              type="button"
              className="mt-3 w-full rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={() => props.state.setOpen(false)}
              ref={cancelButtonRef}
            >
              Abbrechen
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
