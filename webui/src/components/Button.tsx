import { FC, HTMLAttributes } from "react";

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  type: "submit" | "reset" | "button" | undefined;
}

export const Button: FC<ButtonProps> = (props: ButtonProps) => {
  return (
    <button
      type={props.type}
      className={`rounded-md bg-blue-600 text-white p-2 mb-3 ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};