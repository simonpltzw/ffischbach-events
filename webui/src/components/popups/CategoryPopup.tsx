import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  ChangeEvent,
  Dispatch,
  FC,
  HTMLAttributes,
  Reducer,
  SetStateAction,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Input } from "../Input";
import { Button } from "../Button";
import { PopupBackdrop, PopupDialogPanel, PopupTitle, Popup, PopupOpener } from "../Popup";
import { Action, Error } from "@/util/types";
import { getDateTime } from "@/util/converter";
import { Category } from "@/models/Category";

export interface EditCategoriesPopupProps extends HTMLAttributes<HTMLElement> {
  eventId: string;
  isEdit?: boolean;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  done(category: Category): void;
  categoryToEdit: Category | null;
  setCategoryToEdit: Dispatch<SetStateAction<Category | null>>;
}

export const CategoryPopup: FC<EditCategoriesPopupProps> = (props: EditCategoriesPopupProps) => {
  const empty: Category = {
    id: "",
    eventId: props.eventId,
    name: "",
    signUpFrom: "0",
    signUpTo: "0",
  };

  const [errors, setErrors] = useState<string[]>([]);
  const [category, setCategory] = useReducer<Reducer<Category, Action<Category>>>(
    (state: Category, action: Action<Category>) => {
      const a = {
        ...state,
        ...action,
      };
      return a;
    },
    empty
  );

  useEffect(() => {
    if (!!props.categoryToEdit) {
      setCategory(props.categoryToEdit);
    }
  }, [props.categoryToEdit]);

  const onSubmit = async () => {
    try {
      await props.done(category);
      props.setVisible(false);
      props.setCategoryToEdit(null);
    } catch (e: any) {
      const error = e.response.data as Error;
      setErrors([error.title]);
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
        state={{ open: props.visible, setOpen: props.setVisible }}
        onClose={() => {
          setCategory(empty);
        }}
      >
        <PopupBackdrop />
        <PopupDialogPanel>
          <PopupTitle>Kategorien bearbeiten</PopupTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div id="form" className="mt-2 flex flex-col gap-3 w-fit">
              <Input
                title="Name"
                isFocus={props.visible}
                type="text"
                labelClassName="text-white"
                value={category.name}
                containerClassName="w-96"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCategory({ name: e.target.value })
                }
              />
              <Input
                title="Start (Anmeldezeitraum)"
                type="datetime-local"
                labelClassName="text-white"
                value={getDateTime(category.signUpFrom)}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCategory({ signUpFrom: e.target.value })
                }
              />
              <Input
                title="Ende (Anmeldezeitraum)"
                type="datetime-local"
                labelClassName="text-white"
                value={getDateTime(category.signUpTo)}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCategory({ signUpTo: e.target.value })
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
                onClick={() => {
                  props.setVisible(false);
                  props.setCategoryToEdit(null);
                }}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </PopupDialogPanel>
      </Popup>
      <div>{props.children}</div>
    </>
  );
};
