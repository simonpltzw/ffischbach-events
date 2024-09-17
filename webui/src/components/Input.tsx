import {
  ChangeEvent,
  FC,
  HTMLAttributes,
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
} from "react";

export interface InputProps extends HTMLAttributes<HTMLElement>, JSX.IntrinsicAttributes {
  title?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
  labelClassName?: string;
  disabled?: boolean;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  containerClassName?: string;
}

export const Input: FC<InputProps> = (props: InputProps) => {
  props = {
    type: "text",
    labelClassName: "",
    containerClassName: "",
    ...props,
  };

  const bgStyle = () => {
    if (props.disabled) {
      return "bg-gray-300 dark:bg-gray-700/70";
    } else {
      return "bg-gray-50 dark:bg-gray-900 ";
    }
  };

  return (
    <div className={`w-full ${props.containerClassName}`}>
      {props.title && (
        <label
          className={`block text-sm font-semibold h-fit mb-2 ${props.labelClassName}`}
          htmlFor="username"
        >
          {props.title}
        </label>
      )}
      <input
        className={`
        shadow appearance-none border rounded w-full py-2 px-3 dark:text-white leading-tight focus:outline-none focus:shadow-outline 
        text-black dark:text-white dark:border-0 h-10 ${bgStyle()}
        ${props.className}`}
        type={props.type}
        autoComplete=""
        disabled={props.disabled}
        placeholder={props.placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (props.onChange) {
            props.onChange(e);
          }
        }}
        value={props.value}
      />
    </div>
  );
};
