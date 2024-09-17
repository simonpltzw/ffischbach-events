import { FC, HTMLAttributes } from "react";

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  type: "submit" | "reset" | "button" | undefined;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = (props: ButtonProps) => {
  return (
    <button
      type={props.type}
      disabled={props.disabled}
      className={`rounded-md w-fit bg-blue-600 text-white p-3 disabled:cursor-default ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};
