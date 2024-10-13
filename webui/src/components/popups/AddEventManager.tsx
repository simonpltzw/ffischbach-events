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
import { PopupBackdrop, PopupDialogPanel, PopupTitle, Popup, PopupOpener } from "../Popup";
import { AxiosError, AxiosResponse } from "axios";

export interface AddEventManagerPopupProps extends HTMLAttributes<HTMLElement> {
  done(email: string): void;
}

export const AddEventManagerPopup: FC<AddEventManagerPopupProps> = (
  props: AddEventManagerPopupProps
) => {
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!visible) {
      setEmail("");
      setErrors([]);
    }
  }, [visible]);

  const onSubmit = async () => {
    try {
      await props.done(email);
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
          setEmail("");
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
              <Input
                isFocus={visible}
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
                type="submit"
                colorstyle="bg-green-600 hover:bg-green-700 hover:dark:bg-green-400"
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
          </form>
        </PopupDialogPanel>
      </Popup>
      <PopupOpener onClick={() => setVisible(true)}>{props.children}</PopupOpener>
    </>
  );
};
