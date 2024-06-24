import { Event } from "@/models/in/Event";
import { EventOut } from "@/models/out/EventOut";
import { createEvent } from "@/services/eventsService";
import { encryptWithPassword } from "@/services/passwordService";
import { getToken } from "@/services/tokenService";
import { AuthenticationResult } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { Dialog, Transition } from "@headlessui/react";
import { AxiosResponse } from "axios";
import {
  Dispatch,
  FC,
  Fragment,
  HTMLAttributes,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

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
  const { instance, accounts } = useMsal();

  useEffect(() => {
    if (!props.state.open) {
      setName("");
      setDescription("");
      setErrors([]);
    }
  }, [props.state.open]);

  const onSubmit = async () => {
    getToken(instance, accounts[0]).then((res: AuthenticationResult) => {
      const token: string = res.accessToken;
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
    <Transition.Root show={props.state.open} as={Fragment}>
      <Dialog
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={props.state.setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                        Event erstellen
                      </Dialog.Title>
                      <div id="form" className="mt-2 flex flex-col gap-3 text-gray-900">
                        <input
                          type="text"
                          placeholder="Name"
                          autoComplete="none"
                          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Beschreibung"
                          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="Passwort"
                          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        {errors.map((error: string, index: number) => {
                          return generateErrorMessage(error, index);
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-3 bg-gray-50 px-4 py-3  ">
                  <button
                    type="button"
                    className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
