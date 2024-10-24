import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Dispatch, FC, HTMLAttributes, SetStateAction, useEffect, useState } from "react";
import { Button } from "../Button";
import { PopupBackdrop, PopupDialogPanel, PopupTitle, Popup, PopupOpener } from "../Popup";

export interface ConfirmPopupProps extends HTMLAttributes<HTMLElement> {
  title?: string;
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

            <div className="flex flex-row gap-3 py-3 justify-end">
              <Button
              color="green"
                type="submit"
              >
                Bestätigen
              </Button>
              <Button
              color="gray"
              styletype="secondary"
                autoFocus={true}
                type="button"
                onClick={() => setVisible(false)}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </PopupDialogPanel>
      </Popup>
      <PopupOpener
        onClick={(e) => {
          e.stopPropagation();
          setVisible(true);
        }}
      >
        {props.children}
      </PopupOpener>
    </div>
  );
};
