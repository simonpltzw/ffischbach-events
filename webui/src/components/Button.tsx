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
  props = {
    ...props,
  };

  const p = `bg-${props.color}-600 hover:bg-${props.color}-700 hover:dark:bg-${props.color}-400`;

  const getStyleType = () => {
    switch (props.styletype) {
      case "tertiary":
        return "bg-transparent shadow-none hover:text-white";
      case "secondary":
        let res = "bg-transparent border";

        switch (props.color) {
          case "blue":
            return `${res} text-blue-500 hover:text-white border-blue-500`;
          case "red":
            return `${res} text-red-500 hover:text-white border-red-500`;
          case "green":
            return `${res} text-green-500 hover:text-white border-green-500`;
          case "gray":
            return `${res} text-gray-500 hover:text-white border-gray-500`;
        }
      case "primary":
        return "text-white";
      default:
        return "text-white";
    }
  };

  const getColor = () => {
    switch (props.color) {
      case "blue":
        return "bg-blue-600 hover:bg-blue-700 hover:dark:bg-blue-400";
      case "red":
        return "bg-red-600 hover:bg-red-700 hover:dark:bg-red-400";
      case "green":
        return "bg-green-600 hover:bg-green-700 hover:dark:bg-green-400";
      case "gray":
        return "bg-gray-600 hover:bg-gray-700 hover:dark:bg-gray-400";

      default:
        return "bg-blue-600 hover:bg-blue-700 hover:dark:bg-blue-400";
    }
  };

  return (
    <button
      type={props.type}
      disabled={props.disabled}
      className={`rounded-md w-fit 
        p-3 disabled:cursor-default shadow-md ${getStyleType()} ${getColor()}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};
