"use client";

import { ChangeEvent, FC, HTMLAttributes, useEffect, useRef, useState } from "react";

export interface ToggleButtonProps extends HTMLAttributes<HTMLElement> {
  value: boolean;
  title?: string;
  disabled?: boolean;
}

export const ToggleButton: FC<ToggleButtonProps> = (props: ToggleButtonProps) => {
  const [value, setValue] = useState<boolean>(props.value);
  const toggler = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const toggle = (e: any) => {
    if (!props.disabled) {
      setValue((v) => !v);
    }
  };

  useEffect(() => {
    if (value) {
      toggler.current?.click();
    }
  }, []);

  useEffect(() => {
    const inputValue = input.current?.value == "true" ? true : false;

    if (inputValue != props.value) {
      toggler.current?.click();
    }
  }, [props.value]);

  return (
    <div className="flex flex-col w-fit">
      {props.title && (
        <label
          className={`block text-sm font-bold h-fit mb-2`}
        >
          {props.title}
        </label>
      )}
      <label
        className={`items-center ${
          props.disabled ? "cursor-default" : "cursor-pointer"
        } h-fit w-fit`}
      >
        <input
          type="checkbox"
          ref={input}
          value={value?.toString() ?? "false"}
          className="sr-only peer"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (!!props.onChange && !props.disabled && e.isTrusted) {
              props.onChange(e);
            }
          }}
          disabled={props.disabled}
        />
        <div
          onClick={toggle}
          ref={toggler}
          className={`relative bg-gray-200 peer-focus:outline-none peer-focus:ring-0 rounded-full peer dark:bg-gray-900 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[5%] after:start-[4%] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[90%] after:w-[46%] after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 
           
            ${props.className}`}
        ></div>
      </label>
    </div>
  );
};
