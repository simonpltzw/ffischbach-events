import { FC, HTMLAttributes, useEffect, useState } from "react";

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  type: "submit" | "reset" | "button" | undefined;
  disabled?: boolean;
  colorstyle?: string;
}

export const Button: FC<ButtonProps> = (props: ButtonProps) => {
  props = {
    colorstyle: "bg-blue-600 hover:bg-blue-700 hover:dark:bg-blue-400",
    ...props,
  };

  return (
    <button
      type={props.type}
      disabled={props.disabled}
      className={`${props.className} rounded-md w-fit 
        ${props.colorstyle}
        text-white p-3 disabled:cursor-default shadow-md `}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};
