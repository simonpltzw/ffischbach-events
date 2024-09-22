import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
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

export interface AddEventManagerPopupProps extends HTMLAttributes<HTMLElement> {
  state: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
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
      <Popup
        state={{ ...props.state }}
        onClose={() => {
          setEmail("");
        }}
      >
        <PopupBackdrop />
        <PopupDialogPanel>
          <PopupTitle>Event Manager hinzufügen</PopupTitle>
          <div id="form" className="mt-2 flex flex-col gap-3 w-80">
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
    </>
  );
};
