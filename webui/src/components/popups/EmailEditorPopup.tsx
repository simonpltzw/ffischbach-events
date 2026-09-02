import { ChangeEvent, FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { Popup, PopupBackdrop, PopupDialogPanel, PopupOpener, PopupTitle } from "../Popup";
import { TextArea } from "../TextArea";
import { useToast } from "@/context/toast";
import { ConfirmPopup } from "./ConfirmPopup";

export interface EmailEditorPopupProps extends PropsWithChildren {
  title: string;
  done(emailContent: string): Promise<void>;
  sendTestAction(id: string): Promise<void>;
  emailContent: string;
  eventId: string;
}

export const EmailEditorPopup: FC<EmailEditorPopupProps> = (props: EmailEditorPopupProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [text, setText] = useState<string>(props.emailContent);
  const [isConfirmDiscard, setIsConfirmDiscard] = useState<boolean>(false);

  const { addToast } = useToast();

  const onSubmit = () => {
    props.done(text);
    addToast({
      message: "Email template gespeichert",
      type: "info",
    });
    setHasChanges(false);
    setVisible(false);
  };

  const generateErrorMessage = (error: string, index: number) => {
    return (
      <label key={`create-error-${index}`} htmlFor="form" className="text-red-500">
        {error}
      </label>
    );
  };

  const onSendTest = async () => {
    await props.done(text);

    setTimeout(() => {
      props.sendTestAction(props.eventId);
      setHasChanges(false);
      addToast({
        message: "Test email gesendet",
        type: "info",
      });
    }, 1000);
  };

  useEffect(() => {
    if (visible) {
      setText(props.emailContent);
      setIsConfirmDiscard(false);
    }
  }, [visible]);

  return (
    <>
      <Popup
        state={{ open: visible, setOpen: setVisible }}
        onClose={() => {
          if (hasChanges) {
            setIsConfirmDiscard(true);
          } else {
            setVisible(false);
            setHasChanges(false);
          }
        }}
        preventClose
      >
        <PopupBackdrop />
        <PopupDialogPanel className="max-w-screen">
          <PopupTitle>{props.title}</PopupTitle>
          <div
            className="w-fit"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div id="form" className="mt-2 flex flex-col gap-3 w-[80vw]">
              <TextArea
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                  if (!hasChanges) {
                    setHasChanges(true);
                  }

                  setText(event.target.value);
                }}
                className="min-h-[70vh]"
                value={text}
              />
            </div>
            <div className="flex flex-col gap-2">
              {errors.map((error: string, index: number) => {
                return generateErrorMessage(error, index);
              })}
            </div>
            <div className="flex flex-row py-3 gap-3 justify-end">
              <Button color="blue" type="button" onClick={onSendTest}>
                Test senden (speichern)
              </Button>

              <Button color="green" type="button" onClick={() => onSubmit()}>
                Speichern
              </Button>

              <Button
                color="red"
                styletype="secondary"
                type="button"
                onClick={() => {
                  if (!hasChanges) {
                    setVisible(false);
                  }
                  setIsConfirmDiscard(true);
                }}
              >
                {hasChanges ? "Verwerfen" : "Schließen"}
              </Button>
            </div>
          </div>
        </PopupDialogPanel>
        <ConfirmPopup
          open={isConfirmDiscard && hasChanges}
          title="Änderungen verwerfen"
          done={(isConfirmed) => {
            if (isConfirmed) {
              setVisible(false);
              setHasChanges(false);
            } else {
              setIsConfirmDiscard(false);
            }
          }}
        />
      </Popup>
      <PopupOpener onClick={() => setVisible(true)}>{props.children}</PopupOpener>
    </>
  );
};
