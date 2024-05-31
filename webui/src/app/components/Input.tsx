import { FC, HTMLAttributes, HTMLInputTypeAttribute, useEffect, useState } from "react";

export interface InputProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
}

export const Input: FC<InputProps> = (props: InputProps) => {
  props = {
    type: "text",
    ...props,
  };

  const [value, setValue] = useState<string>(props.value ?? '');

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
        {props.title}
      </label>
      <input
        className={`
        shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline 
        dark:text-white dark:bg-gray-700 dark:border-0
        ${props.className}`}
        type={props.type}
        placeholder={props.placeholder}
        onChange={(e: any) => {
          //setValue(e.target.value);
          if (props.onChange) {
            props.onChange(e);
          }
        }}
        value={props.value}
      />
    </div>
  );
};
