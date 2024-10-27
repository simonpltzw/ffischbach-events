import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { FC, SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  title: string;
  value: any;
}

export const Select: FC<SelectProps> = (props: SelectProps) => {
  return (
    <div>
      <div className="block text-sm font-semibold h-8 mb-1">{props.title}</div>
      <div className="relative">
        <select
          value={props.value}
          disabled={props.disabled}
          className={`appearance-none
            shadow-md border rounded w-full py-2 pl-3 pr-5 dark:text-white leading-tight outline-none 
               focus:border-2 focus:border-blue-500 dark:focus:border-2 dark:focus:border-blue-500
               text-black dark:text-white dark:border-0 text-sm
               block p-2.5 dark:placeholder-gray-400 dark:text-white ${
                 props.disabled ? "bg-gray-200 dark:bg-gray-700/70" : "bg-white dark:bg-gray-900"
               }`}
          onChange={props.onChange}
        >
          {props.children}
        </select>
        <div className="flex  items-center absolute inset-y-0 right-3">
        <ChevronDownIcon height={20} />
        </div>
      </div>
    </div>
  );
};
