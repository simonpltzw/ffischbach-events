import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Dispatch, FC, HTMLAttributes, SetStateAction, useEffect, useState } from "react";
import { Button } from "../Button";
import { PopupBackdrop, PopupDialogPanel, PopupTitle, Popup, PopupOpener } from "../Popup";

export interface ConfirmPopupProps extends HTMLAttributes<HTMLElement> {
  done(): void;
}

export const ConfirmPopup: FC<ConfirmPopupProps> = (props: ConfirmPopupProps) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!visible) {
      setErrors([]);
    }
  }, [visible]);

  const onSubmit = async () => {
    try {
      await props.done();
      setVisible(false);
    } catch (e: any) {
      if (e.response?.data) {
        setErrors([e.response.data.detail]);
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
    <div>
      <Popup state={{ open: visible, setOpen: setVisible }}>
        <PopupBackdrop />
        <PopupDialogPanel>
          <PopupTitle>{props.title}</PopupTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>

            <div className="flex flex-row gap-3 py-3">
              <Button
                type="submit"
                colorstyle="bg-green-600 hover:bg-green-700 hover:dark:bg-green-400"
              >
                Bestätigen
              </Button>
              <Button
                autoFocus={true}
                type="button"
                onClick={() => setVisible(false)}
                colorstyle="bg-gray-600 hover:bg-gray-700 hover:dark:bg-gray-400"
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </PopupDialogPanel>
      </Popup>
      <PopupOpener onClick={() => setVisible(true)}>{props.children}</PopupOpener>
    </div>
  );
};
