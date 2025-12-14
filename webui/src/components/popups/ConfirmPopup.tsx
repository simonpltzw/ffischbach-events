import { FC, HTMLAttributes, useEffect, useEffectEvent, useState } from "react";
import { Button } from "../Button";
import { PopupBackdrop, PopupDialogPanel, PopupTitle, Popup, PopupOpener } from "../Popup";
import useErrorHandler from "@/services/errorHandler";

export interface ConfirmPopupProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  done?(isConfirmed: boolean): void;
  open?: boolean;
}

export const ConfirmPopup: FC<ConfirmPopupProps> = (props: ConfirmPopupProps) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  const errorHandler = useErrorHandler();

  const onIsHidden = useEffectEvent(() => {
    setErrors([]);
  });

  useEffect(() => {
    if (!visible) {
      onIsHidden();
    }
  }, [visible]);

  useEffect(() => {
    if (props.open != undefined) {
      setVisible(props.open);
    }
  }, [props.open]);

  const onSubmit = async () => {
    try {
      if (props.done) {
        await props.done(true);
      }
      setVisible(false);
    } catch (e: any) {
      errorHandler(e, setErrors);
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
          <PopupTitle>
            <div className="break-all">{props.title}</div>
          </PopupTitle>
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
              <Button color="green" type="submit">
                Bestätigen
              </Button>
              <Button
                color="gray"
                styletype="secondary"
                autoFocus={true}
                type="button"
                onClick={() => {
                  setVisible(false);
                  if (props.done) {
                    props.done(false);
                  }
                }}
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
