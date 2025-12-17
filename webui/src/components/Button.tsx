import { FC, HTMLAttributes, useEffect, useState } from "react";

type Color = "blue" | "red" | "green" | "gray";
type StyleType = "primary" | "secondary" | "tertiary";

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  type: "submit" | "reset" | "button" | undefined;
  styletype?: StyleType;
  color?: Color;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = (props: ButtonProps) => {
  const getStyleType = () => {
    switch (props.styletype) {
      case "tertiary":
        return "bg-transparent shadow-none hover:text-white";
      case "secondary":
        let res = "bg-transparent border";

        switch (props.color) {
          case "red":
            return `${res} text-red-500 disabled:text-red-500 hover:text-white border-red-500 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent`;
          case "green":
            return `${res} text-green-500 disabled:text-green-500 hover:text-white border-green-500 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent`;
          case "gray":
            return `${res} text-gray-500 disabled:text-gray-500 hover:text-white border-gray-500 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent`;
          case "blue":
          default:
            return `${res} text-blue-500 disabled:text-blue-500 hover:text-white border-blue-500 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent`;
        }
      case "primary":
        return "text-white";
      default:
        return "text-white";
    }
  };

  const getColor = () => {
    switch (props.color) {
      case "red":
        return "bg-red-600 hover:bg-red-700 dark:hover:bg-red-400 disabled:hover:bg-red-600 dark:disabled:hover:bg-red-600";
      case "green":
        return "bg-green-600 hover:bg-green-700 dark:hover:bg-green-400 disabled:hover:bg-green-600 dark:disabled:hover:bg-green-600";
      case "gray":
        return "bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-400 disabled:hover:bg-gray-600 dark:disabled:hover:bg-gray-600";
      case "blue":
      default:
        return "bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-400 disabled:hover:bg-blue-600 dark:disabled:hover:bg-blue-600";
    }
  };

  return (
    <button
      type={props.type}
      disabled={props.disabled}
      className={`flex items-center gap-3 rounded-md w-fit text-nowrap
        py-1 px-2 disabled:cursor-default shadow-md ${
          props.className
        } ${getStyleType()} ${getColor()}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};
