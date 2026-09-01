import {
  ChangeEvent,
  FC,
  HTMLAttributes,
  Reducer,
  useEffect,
  useReducer,
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
import { ParticipantEdit } from "@/models/out/ParticipantEdit";
import { Action } from "@/util/types";

export interface SwapContactPopupProps extends HTMLAttributes<HTMLElement> {
  done(participant: ParticipantEdit): void;
  participant?: ParticipantEdit | undefined;
  setParticipant?: React.Dispatch<
    React.SetStateAction<ParticipantEdit | undefined>
  >;
  visible?: boolean;
  isSwap?: boolean;
  disabled?: boolean;
}

export const SwapContactPopup: FC<SwapContactPopupProps> = (
  props: SwapContactPopupProps,
) => {
  const [editParticipant, setEditParticipant] = useReducer<
    Partial<ParticipantEdit> | undefined,
    [Partial<Action<ParticipantEdit>> | undefined]
  >(
    (
      state: Partial<ParticipantEdit> | undefined,
      action: Partial<Action<ParticipantEdit>> | undefined,
    ) => {
      return {
        ...state,
        ...action,
      };
    },
    undefined,
  );

  const errorHandler = useErrorHandler();

  const [errors, setErrors] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (props.isSwap) {
      setVisible(!!props.participant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.participant]);

  useEffect(() => {
    if (!visible) {
      setEditParticipant(undefined);
      if (props.setParticipant) {
        props.setParticipant(undefined);
      }
      setErrors([]);
    } else {
      setEditParticipant(props.participant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const onSubmit = async () => {
    try {
      if (editParticipant) {
        const editP: ParticipantEdit = editParticipant as ParticipantEdit;
        props.done(editP);

        setVisible(false);
        setEditParticipant(undefined);
      }
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
          setEditParticipant(undefined);
        }}
      >
        <PopupBackdrop />
        <PopupDialogPanel>
          <PopupTitle>Kontakt austauschen</PopupTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div id="form" className="mt-2 flex flex-col gap-3 w-80">
              <Input
                title="Vorname"
                isFocus={visible}
                required
                type="text"
                placeholder="Vorname"
                labelClassName="text-white"
                value={editParticipant?.firstName ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditParticipant({ firstName: e.target.value })
                }
              />
              <Input
                title="Nachname"
                type="text"
                required
                placeholder="Nachname"
                labelClassName="text-white"
                value={editParticipant?.lastName ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditParticipant({ lastName: e.target.value })
                }
              />
              <Input
                title="Geburtsdatum"
                type="date"
                required
                placeholder="Geburtsdatum"
                labelClassName="text-white"
                value={editParticipant?.birthDate ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditParticipant({ birthDate: e.target.value })
                }
              />
              <Input
                title="Email"
                type="text"
                required
                placeholder="Email"
                labelClassName="text-white"
                value={editParticipant?.email ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditParticipant({ email: e.target.value })
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
