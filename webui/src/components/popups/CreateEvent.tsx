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
import { PopupBackdrop, PopupDialogPanel, PopupTitle, Popup } from "../Popup";

export interface CreateEventPopupProps extends HTMLAttributes<HTMLElement> {
  state: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
  };
  done(event: Event): void;
}


export const CreateEventPopup: FC<CreateEventPopupProps> = (props: CreateEventPopupProps) => {
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
    <Popup state={{ ...props.state }}>
      <PopupBackdrop />
      <PopupDialogPanel>
        <PopupTitle>Event erstellen</PopupTitle>
        <div id="form" className="mt-2 flex flex-col gap-3 w-80">
          <Input
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
            onClick={() => props.state.setOpen(false)}
          >
            Abbrechen
          </Button>
        </div>
      </PopupDialogPanel>
    </Popup>
  );
};
