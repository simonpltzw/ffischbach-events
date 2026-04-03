import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SwapContactPopup } from "@/components/popups/SwapContactPopup";
import { useEventSettings } from "@/context/eventSettings";
import { GroupAction } from "@/context/group";
import { useToast } from "@/context/toast";
import { Group } from "@/models/in/Group";
import { Participant } from "@/models/in/Participant";
import { ParticipantEdit } from "@/models/out/ParticipantEdit";
import { decryptParticipant } from "@/services/decryptService";
import useErrorHandler from "@/services/errorHandler";
import { useParticipantService } from "@/services/participantService";
import { Action } from "@/util/types";
import { ChangeEvent, Dispatch, FC, useReducer } from "react";

export interface NewParticipantProps {
  encPrivateKey?: string;
  groupId: string;
  setParticipants: Dispatch<React.SetStateAction<Participant[]>>;
  contact: Participant;
  groupState: Group;
  dispatchGroup: React.Dispatch<GroupAction>;
  disabled?: boolean;
}

export const NewParticipant: FC<NewParticipantProps> = (props: NewParticipantProps) => {
  const { addToast } = useToast();
  const [eventSettings] = useEventSettings();

  const { addParticipant, addContact } = useParticipantService();
  const errorHandler = useErrorHandler();

  const empty: ParticipantEdit = {
    id: "",
    groupId: "",
    firstName: "",
    lastName: "",
    email: undefined,
    birthDate: "",
  };

  const [participant, setParticipant] = useReducer<ParticipantEdit, [Action<ParticipantEdit>]>(
    (state, action) => {
      return {
        ...state,
        ...action,
      };
    },
    empty
  );

  const onAddParticipant = () => {
    const updatedParticipant: ParticipantEdit = {
      ...participant,
      groupId: props.groupId,
    };

    addParticipant(updatedParticipant)
      .then((p) => {
        const event = props.groupState.event;

        if (eventSettings.password && props.encPrivateKey) {
          decryptParticipant(
            p,
            eventSettings.password,
            props.encPrivateKey,
            event?.PrivateKeyEncryptionSalt!,
            event?.PrivateKeyEncryptionIV!
          ).then((newP) => {
            props.setParticipants((list) => [...list, newP]);
            setParticipant({ ...empty });
            addToast({ message: "Teilnehmer hinzugefügt", type: "info" });
          });
        }
      })
      .catch((e) => errorHandler(e));
  };

  const onReplaceWithContact = (p: ParticipantEdit) => {
    p.groupId = props.groupId;

    addContact(p)
      .then((p) => {
        const event = props.groupState.event;

        if (eventSettings.password && props.encPrivateKey) {
          decryptParticipant(
            p,
            eventSettings.password,
            props.encPrivateKey,
            event?.PrivateKeyEncryptionSalt!,
            event?.PrivateKeyEncryptionIV!
          ).then((newP) => {
            props.setParticipants((list) => [...list, props.contact]);
            props.dispatchGroup({ type: "contact_new", value: newP });

            setParticipant({ ...empty });
            addToast({ message: "Kontakt neu gesetzt", type: "info" });
          });
        }
      })
      .catch((e) => errorHandler(e));
  };

  return (
    <div className="flex gap-3 w-full items-end">
      <Input
        title="Vorname"
        type="text"
        disabled={props.disabled}
        value={participant.firstName}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setParticipant({ firstName: e.target.value })
        }
      />
      <Input
        title="Nachname"
        type="text"
        disabled={props.disabled}
        value={participant.lastName}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setParticipant({ lastName: e.target.value })
        }
      />
      <Input
        title="Geburtsdatum"
        type="date"
        disabled={props.disabled}
        value={participant.birthDate}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setParticipant({ birthDate: e.target.value })
        }
      />
      <Button
        disabled={props.disabled}
        className="h-fit"
        type="button"
        styletype="primary"
        onClick={onAddParticipant}
      >
        Hinzufügen
      </Button>
      <SwapContactPopup participant={participant} done={(p) => onReplaceWithContact(p)}>
        <Button disabled={props.disabled} type="button" styletype="secondary">
          Ersetzen mit Kontakt
        </Button>
      </SwapContactPopup>
    </div>
  );
};
