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
import useErrorHandler from "@/services/errorHandler";

export interface AddEventManagerPopupProps extends HTMLAttributes<HTMLElement> {
  done(email: string): void;
}

export const AddEventManagerPopup: FC<AddEventManagerPopupProps> = (
  props: AddEventManagerPopupProps,
) => {
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const errorHandler = useErrorHandler();

  const onIsHidden = useEffectEvent(() => {
    setEmail("");
    setErrors([]);
  });

  useEffect(() => {
    if (!visible) {
      onIsHidden();
    }
  }, [visible]);

  const onSubmit = async () => {
    try {
      await props.done(email);
      setVisible(false);
    } catch (e: any) {
      errorHandler(e, setErrors);
    }
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
                labelClassName="text-white"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>
            <div className="flex flex-row py-3 gap-3 justify-end">
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
