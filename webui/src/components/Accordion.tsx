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
        <div className={`flex items-center justify-between select-none gap-3 p-3 w-full bg-gray-200 dark:bg-gray-900 cursor-pointer ${expanded ? "rounded-t-md" : "rounded-md"}`}>{props.opener}</div>
      </div>
      <div hidden={!expanded}>{props.children}</div>
    </div>
  );
};