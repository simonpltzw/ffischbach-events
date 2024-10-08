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

export interface PasswordPopupProps extends HTMLAttributes<HTMLElement> {
  title: string;

  done(password: string): Promise<void>;
}

export const PasswordPopup: FC<PasswordPopupProps> = (props: PasswordPopupProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) {
      setPassword("");
      setErrors([]);
    }
  }, [visible]);

  const onSubmit = async () => {
    try {
      await props.done(password);
      setVisible(false);
    } catch (e) {
      //info: german error is existing...
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
      <Popup
        state={{ open: visible, setOpen: setVisible }}
        onClose={() => {
          setPassword("");
        }}
      >
        <PopupBackdrop />
        <PopupDialogPanel>
          <PopupTitle>{props.title}</PopupTitle>
          <form id="form" className="mt-2 flex flex-col gap-3 w-80">
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
