import {
  ChangeEvent,
  FC,
  HTMLAttributes,
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
  useEffect,
  useRef,
} from "react";

export interface InputProps extends HTMLAttributes<HTMLElement>, JSX.IntrinsicAttributes {
  title?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
  labelClassName?: string;
  isFocus?: boolean;
  disabled?: boolean;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  containerClassName?: string;
}

export const Input: FC<InputProps> = (props: InputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.isFocus) {
      inputRef.current?.focus();
    }
  }, [props.isFocus]);

  props = {
    type: "text",
    labelClassName: "",
    containerClassName: "",
    ...props,
  };

  const bgStyle = () => {
    if (props.disabled) {
      return "disabled:bg-gray-300/50 disabled:dark:bg-gray-500/50";
    } else {
      return "bg-white dark:bg-gray-900 focus:border-2 focus:border-blue-500 dark:focus:border-2 dark:focus:border-blue-500";
    }
  };

  return (
    <div className={`w-full ${props.containerClassName}`}>
      {props.title && (
        <label
          className={`block text-sm font-semibold h-fit mb-1 ${props.labelClassName}`}
          htmlFor="username"
        >
          {props.title}
        </label>
      )}
      <input
        ref={inputRef}
        className={`
        shadow-md appearance-none border rounded w-full py-2 px-3 dark:text-white leading-tight focus:outline-none
        text-black dark:text-white dark:border-0 h-10 ${bgStyle()}
        ${props.className ?? ""}`}
        type={props.type}
        autoFocus={props.autoFocus}
        autoComplete={props.autoComplete}
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
