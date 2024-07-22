import { FC, HTMLAttributes, HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute, useEffect, useState } from "react";

export interface InputProps extends HTMLAttributes<HTMLElement>, JSX.IntrinsicAttributes {
  title?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
  labelClassName?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute
  containerClassName?: string;
}

export const Input: FC<InputProps> = (props: InputProps) => {
  props = {
    type: "text",
    labelClassName: "",
    containerClassName: "",
    ...props,
  };

  return (
    <div className={`full ${props.containerClassName}`}>
      <label className={`block text-sm font-bold h-fit mb-2 ${props.labelClassName}`} htmlFor="username">
        {props.title}
      </label>
      <input
        className={`
        shadow appearance-none border rounded w-full py-2 px-3 dark:text-white leading-tight focus:outline-none focus:shadow-outline 
        bg-gray-50 text-black dark:text-white dark:bg-gray-900 dark:border-0 h-10
        ${props.className}`}
        type={props.type}
        autoComplete=""
        placeholder={props.placeholder}
        onChange={(e: any) => {
          if (props.onChange) {
            props.onChange(e);
          }
        }}
        value={props.value}
      />
    </div>
  );
};
