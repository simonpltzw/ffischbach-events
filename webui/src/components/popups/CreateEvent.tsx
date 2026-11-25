import { Event } from "@/models/in/Event";
import { EventOut } from "@/models/out/EventOut";
import { encryptWithPassword } from "@/services/passwordService";
import {
  ChangeEvent,
  FC,
  HTMLAttributes,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { Input } from "../Input";
import { Button } from "../Button";
import {
  PopupBackdrop,
  PopupDialogPanel,
  PopupTitle,
  Popup,
  PopupOpener,
} from "../Popup";
import { useEventService } from "@/services/eventsService";
import useErrorHandler from "@/services/errorHandler";

export interface CreateEventPopupProps extends HTMLAttributes<HTMLElement> {
  done(event: Event): void;
}

export const CreateEventPopup: FC<CreateEventPopupProps> = (
  props: CreateEventPopupProps,
) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);

  const errorHandler = useErrorHandler();
  const { createEvent } = useEventService();
  const [errors, setErrors] = useState<string[]>([]);

  const onIsHidden = useEffectEvent(() => {
    setName("");
    setDescription("");
    setPassword("");
    setErrors([]);
  });

  useEffect(() => {
    if (!visible) {
      onIsHidden;
    }
  }, [visible]);

  const onSubmit = async () => {
    encryptWithPassword(password).then(({ encryptedPrivateKey, publicKey, salt, iv }) => {
      const newEvent: EventOut = {
        id: `${name}`,
        description,
        date,
        encryptedPrivateKey,
        publicKey,
        privateKeyEncryptionSalt: salt,
        privateKeyEncryptionIV: iv
      };

      createEvent(newEvent)
        .then((r: Event) => {
          props.done(r);
          setVisible(false);
        })
        .catch((e: any) => errorHandler(e, setErrors));
    });
  };

  const generateErrorMessage = (error: string, index: number) => {
    return (
      <label
        key={`create-error-${index}`}
        htmlFor="form"
        className="text-red-500"
      >
        {error}
      </label>
    );
  };

  return (
    <>
      <Popup state={{ open: visible, setOpen: setVisible }}>
        <PopupBackdrop />
        <PopupDialogPanel>
          <PopupTitle>Event erstellen</PopupTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div id="form" className="mt-2 flex flex-col gap-3 w-80">
              <Input
                title="Name"
                isFocus={visible}
                type="text"
                placeholder="Name"
                value={name}
                labelClassName="text-white"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
              />
              <Input
                title="Beschreibung"
                type="text"
                placeholder="Beschreibung"
                value={description}
                labelClassName="text-white"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDescription(e.target.value)
                }
              />
              <Input
                title="Veranstaltungsdatum"
                type="datetime-local"
                placeholder="Veranstaltungsdatum"
                value={date}
                labelClassName="text-white"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDate(new Date(e.target.value).toISOString())
                }
              />
              <Input
                title="Passwort"
                type="password"
                placeholder="Passwort"
                autoComplete="new-password"
                value={password}
                labelClassName="text-white"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>
            <div className="flex flex-row gap-3 py-3 justify-end">
              <Button color="green" type="submit">
                Bestätigen
              </Button>
              <Button
                color="gray"
                styletype="secondary"
                type="button"
                onClick={() => setVisible(false)}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </PopupDialogPanel>
      </Popup>
      <PopupOpener onClick={() => setVisible(true)}>
        {props.children}
      </PopupOpener>
    </>
  );
};
