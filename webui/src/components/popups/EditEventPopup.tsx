import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  ChangeEvent,
  Dispatch,
  FC,
  HTMLAttributes,
  Reducer,
  SetStateAction,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Input } from "../Input";
import { Button } from "../Button";
import { PopupBackdrop, PopupDialogPanel, PopupTitle, Popup, PopupOpener } from "../Popup";
import { Event } from "@/models/in/Event";
import { Action } from "@/util/types";
import { EditEvent } from "@/models/EditEvent";
import { CheckBox } from "../CheckBox";
import { getDateTime } from "@/util/converter";

export interface EditEventPopupProps extends HTMLAttributes<HTMLElement> {
  event: Event;
  done(event: EditEvent): void;
}

export const EditEventPopup: FC<EditEventPopupProps> = (props: EditEventPopupProps) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  const getEditEvent = (event: Event): EditEvent => {
    return {
      description: event.description,
      completed: event.completed,
      date: event.date,
    };
  };

  const [event, setEvent] = useReducer<Reducer<EditEvent, Action<Partial<EditEvent>>>>(
    (state: EditEvent, action: Action<Partial<EditEvent>>) => {
      return {
        ...state,
        ...action,
      };
    },
    getEditEvent(props.event)
  );

  useEffect(() => {
    if (!visible) {
      setErrors([]);
    }
  }, [visible]);

  const onSubmit = async () => {
    try {
      await props.done(event);
      setVisible(false);
    } catch (e: any) {
      if (e.response?.data) {
        setErrors(Object.entries(e.response.data.errors).map((error: any) => error[1]));
      }
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
      <Popup
        state={{ open: visible, setOpen: setVisible }}
        onClose={() => {
          setEvent(getEditEvent(props.event));
        }}
      >
        <PopupBackdrop />
        <PopupDialogPanel>
          <PopupTitle>Event Manager hinzufügen</PopupTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div id="form" className="mt-2 flex flex-col gap-3 w-80">
              <CheckBox
                title="Beendet"
                value={event.completed}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {}}
              />
              <Input
                title="Beschreibung"
                isFocus={visible}
                type="text"
                placeholder="Beschreibung"
                value={event.description}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEvent({ description: e.target.value })
                }
              />
              <Input
                title="Veranstaltungsdatum"
                type="datetime-local"
                placeholder="Veranstaltungsdatum"
                value={getDateTime(event.date)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEvent({ date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>
            <div className="flex flex-row py-3 gap-3 justify-end">
              <Button
              color="green"
                type="submit"
              >
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
      <PopupOpener onClick={() => setVisible(true)}>{props.children}</PopupOpener>
    </>
  );
};
