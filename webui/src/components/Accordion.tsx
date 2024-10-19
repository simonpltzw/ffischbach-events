import { FC, HTMLAttributes, ReactNode, useState } from "react";

export interface AccordionProps extends HTMLAttributes<HTMLDetailsElement> {
  opener: ReactNode;
}

export const Accordion: FC<AccordionProps> = (props: AccordionProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggle = () => {
    setExpanded((e) => !e);
  };

  return (
    <div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
      >
        {props.opener}
      </div>
      <div className="mt-3" hidden={!expanded}>
        {props.children}
      </div>
    </div>
  );
};

/**
 * <EditCategoriesPopup
            categories={state.categories}
            setCategories={() => {}}
            done={() => {}}
          >
            <Button className="md:flex-none flex-1" type="button">
              Kategorien bearbeiten
            </Button>
          </EditCategoriesPopup>
 * 
 */
