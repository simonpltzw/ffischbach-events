import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import { CategoryPopup } from "@/components/popups/CategoryPopup";
import { ConfirmPopup } from "@/components/popups/ConfirmPopup";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table/Table";
import { useToast } from "@/context/toast";
import { Category } from "@/models/Category";
import { Event } from "@/models/in/Event";
import { useCategoriesService } from "@/services/categoryService";
import useErrorHandler from "@/services/errorHandler";
import useToken from "@/services/tokenService";
import { getLocalDateTime } from "@/util/converter";
import { Action } from "@/util/types";
import { ChevronDownIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { Dispatch, FC, useEffect, useState } from "react";

export interface CategoriesProps {
  isVisible: boolean;
  dispatch: Dispatch<Action<Partial<Event>>>;
  state: Event;
}

export const Categories: FC<CategoriesProps> = (props: CategoriesProps) => {
  const { addToast } = useToast();
  const errorHandler = useErrorHandler();

  const { createCategory, deleteCategory, putCategory } = useCategoriesService();

  const [isCategoryEditPopupVisible, setIsCategoryEditPopupVisible] = useState<boolean>(false);
  const [isCategoryCreatePopupVisible, setIsCategoryCreatePopupVisible] = useState<boolean>(false);

  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const generateCategoryRow = (category: Category) => {
    return (
      <TR
        key={`category-${category.name}-${category.eventId}`}
        className="cursor-pointer"
        onClick={() => {
          setCategoryToEdit({ ...category });
          setIsCategoryEditPopupVisible(true);
        }}
      >
        <TD className="pr-0 w-fit">
          <div className="p-2">{category.name}</div>
        </TD>
        <TD className="pr-0 w-fit">
          <div className="p-2">{getLocalDateTime(category.signUpFrom)}</div>
        </TD>
        <TD className="w-fit">
          <div className="p-2">{getLocalDateTime(category.signUpTo)}</div>
        </TD>
        <TD>
          <PencilIcon height={25} />
        </TD>
        <TD>
          <ConfirmPopup
            title={`Kategorie "${category.name}" löschen?`}
            done={async () => {
              deleteCategory(category.id)
                .then(() => {
                  const updatedList = props.state.categories.filter((c) => c.id != category.id);
                  props.dispatch({ categories: updatedList });
                  addToast({ message: "Kategorie gelöscht", type: "info" });
                })
                .catch((e) => errorHandler(e));
            }}
          >
            <TrashIcon color="red" height={25} />
          </ConfirmPopup>
        </TD>
      </TR>
    );
  };

  return (
    <>
      {!props.isVisible && (
        <div>
          <Accordion
            opener={
              <>
                <div>Kategorien</div>
                <ChevronDownIcon height={20} />
              </>
            }
          >
            <div className="flex flex-col gap-3 border dark:border-0 dark:bg-gray-900/40 shadow p-3 rounded-b-lg">
              <CategoryPopup
                isEdit
                eventId={props.state.id}
                categoryToEdit={categoryToEdit}
                setCategoryToEdit={setCategoryToEdit}
                visible={isCategoryCreatePopupVisible}
                setVisible={setIsCategoryCreatePopupVisible}
                done={async (category: Category) => {
                  createCategory(category)
                    .then((newCategory) => {
                      props.dispatch({ categories: [...props.state.categories, newCategory] });
                      addToast({ message: "Kategorie erstellt", type: "info" });
                    })
                    .catch((e) => errorHandler(e));
                }}
              >
                <Button
                  color="blue"
                  styletype="secondary"
                  type="button"
                  onClick={() => setIsCategoryCreatePopupVisible(true)}
                >
                  Kategorie erstellen
                  <PlusIcon height={25} />
                </Button>
              </CategoryPopup>
              <Table className="border-0">
                <THead>
                  <tr>
                    <TH>Name</TH>
                    <TH>Start (Anmeldezeitraum)</TH>
                    <TH>Ende (Anmeldezeitraum)</TH>
                    <TH></TH>
                    <TH></TH>
                  </tr>
                </THead>
                <TBody>{props.state.categories.map((c) => generateCategoryRow(c))}</TBody>
              </Table>
            </div>
          </Accordion>
        </div>
      )}

      <CategoryPopup
        isEdit
        eventId={props.state.id}
        categoryToEdit={categoryToEdit}
        setCategoryToEdit={setCategoryToEdit}
        visible={isCategoryEditPopupVisible}
        setVisible={setIsCategoryEditPopupVisible}
        done={async (category: Category) => {
          const id = category.id;

          putCategory(category)
            .then((updatedCategory) => {
              const index = props.state.categories.findIndex((c) => c.id == id);

              if (index) {
                props.state.categories[index] = updatedCategory;
                props.dispatch({ categories: props.state.categories });
                addToast({ message: "Kategorie geändert", type: "info" });
              }
            })
            .catch((e) => errorHandler(e));
        }}
      />
    </>
  );
};
