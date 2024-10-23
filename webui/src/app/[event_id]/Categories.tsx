import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import { CategoryPopup } from "@/components/popups/CategoryPopup";
import { ConfirmPopup } from "@/components/popups/ConfirmPopup";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table/Table";
import { useToast } from "@/context/toast";
import { Category } from "@/models/Category";
import { Event } from "@/models/in/Event";
import { createCategory, deleteCategory, putCategory } from "@/services/categoryService";
import useToken from "@/services/tokenService";
import { getLocalDateTime } from "@/util/converter";
import { Action } from "@/util/types";
import { ChevronDownIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { Dispatch, FC, useState } from "react";

export interface CategoriesProps {
  isVisible: boolean;
  dispatch: Dispatch<Action<Partial<Event>>>;
  state: Event;
}

export const Categories: FC<CategoriesProps> = (props: CategoriesProps) => {
  const { addToast } = useToast();
  const { getToken } = useToken();

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
          <div className="border rounded bg-gray-400 dark:bg-transparent text-white p-2">
            {category.name}
          </div>
        </TD>
        <TD className="pr-0 w-fit">
          <div className="border rounded bg-gray-400 dark:bg-transparent text-white p-2">
            {getLocalDateTime(category.signUpFrom)}
          </div>
        </TD>
        <TD className="w-fit">
          <div className="border rounded bg-gray-400 dark:bg-transparent text-white p-2">
            {getLocalDateTime(category.signUpTo)}
          </div>
        </TD>
        <TD>
          <ConfirmPopup
            title={`Kategorie "${category.name}" löschen?`}
            done={async () => {
              const token = await getToken();
              await deleteCategory(token, category.id);
              const updatedList = props.state.categories.filter((c) => c.id != category.id);
              props.dispatch({ categories: updatedList });
              addToast({ message: "Kategorie gelöscht", type: "info" });
            }}
          >
            <TrashIcon color="red" height={25} />
          </ConfirmPopup>
        </TD>
        <TD>
          <PencilIcon height={25} />
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
              <Button color="blue" styletype="secondary" type="button">
                <div className="flex items-center gap-3">
                  <div>Kategorien anzeigen</div>
                  <ChevronDownIcon height={20} />
                </div>
              </Button>
            }
          >
            <div className="flex flex-col gap-3 border dark:border-0 dark:bg-gray-900/40 shadow p-3 rounded-lg mb-5">
              <label className="text-lg font-bold">Kategorien</label>
              <CategoryPopup
                isEdit
                eventId={props.state.id}
                categoryToEdit={categoryToEdit}
                setCategoryToEdit={setCategoryToEdit}
                visible={isCategoryCreatePopupVisible}
                setVisible={setIsCategoryCreatePopupVisible}
                done={async (category: Category) => {
                  const token = await getToken();
                  const newCategory = await createCategory(token, category);
                  props.dispatch({ categories: [...props.state.categories, newCategory] });
                  addToast({ message: "Kategorie erstellt", type: "info" });
                }}
              >
                <Button
                  color="blue"
                  styletype="secondary"
                  type="button"
                  onClick={() => setIsCategoryCreatePopupVisible(true)}
                >
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
          const token = await getToken();
          const id = category.id;

          const updatedCategory: Category = await putCategory(token, category);
          const index = props.state.categories.findIndex((c) => c.id == id);

          if (index) {
            props.state.categories[index] = updatedCategory;
            props.dispatch({ categories: props.state.categories });
            addToast({ message: "Kategorie geändert", type: "info" });
          }
        }}
      />
    </>
  );
};
