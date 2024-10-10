import { Event } from "@/models/in/Event";
import { EventOut } from "@/models/out/EventOut";
import { createEvent } from "@/services/eventsService";
import { encryptWithPassword } from "@/services/passwordService";
import useToken from "@/services/tokenService";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { AxiosResponse } from "axios";
import {
  ChangeEvent,
  Dispatch,
  FC,
  HTMLAttributes,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Input } from "../Input";
import { Button } from "../Button";
import { PopupBackdrop, PopupDialogPanel, PopupTitle, Popup, PopupOpener } from "../Popup";

export interface CreateEventPopupProps extends HTMLAttributes<HTMLElement> {
  done(event: Event): void;
}

export const CreateEventPopup: FC<CreateEventPopupProps> = (props: CreateEventPopupProps) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);

  const [errors, setErrors] = useState<string[]>([]);
  const { getToken } = useToken();

  useEffect(() => {
    if (!visible) {
      setName("");
      setDescription("");
      setErrors([]);
    }
  }, [visible]);

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
            setVisible(false);
          })
          .catch((e: any) => {
            if (e.response?.data) {
              setErrors([e.response.data.detail]);
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
    <>
      <Popup state={{open: visible, setOpen: setVisible }}>
        <PopupBackdrop />
        <PopupDialogPanel>
          <PopupTitle>Event erstellen</PopupTitle>
          <div id="form" className="mt-2 flex flex-col gap-3 w-80">
            <Input
              isFocus={visible}
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Beschreibung"
              value={description}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            {errors.map((error: string, index: number) => {
              return generateErrorMessage(error, index);
            })}
          </div>
          <div className="flex flex-row gap-3 py-3">
            <Button
              type="button"
              colorstyle="bg-green-600 hover:bg-green-700 hover:dark:bg-green-400"
              onClick={onSubmit}
            >
              Bestätigen
            </Button>
            <Button
              type="button"
              colorstyle="bg-gray-600 hover:bg-gray-700 hover:dark:bg-gray-400"
              onClick={() => setVisible(false)}
            >
              Abbrechen
            </Button>
          </div>
        </PopupDialogPanel>
      </Popup>
      <PopupOpener onClick={() => setVisible(true)}>{props.children}</PopupOpener>
    </>
  );
};
