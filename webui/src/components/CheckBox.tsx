"use client";

import { ChangeEvent, FC, HTMLAttributes, useEffect, useRef, useState } from "react";

export interface CheckBoxProps extends HTMLAttributes<HTMLElement> {
  value: boolean;
  title?: string;
  size?: number;
  disabled?: boolean;
}

export const CheckBox: FC<CheckBoxProps> = (props: CheckBoxProps) => {
  const [value, setValue] = useState<boolean>(props.value);

  useEffect(() => setValue(props.value), [props.value]);

  return (
    <div className="flex flex-col gap-3">
      {props.title && <label className={`block text-sm font-bold h-fit mb-2`}>{props.title}</label>}
      <div className="flex items-center w-10 h-10">
        <input
          disabled={props.disabled}
          type="checkbox"
          checked={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (!!props.onChange) {
              props.onChange(e);
            }
            setValue(e.target.checked);
          }}
          className="relative shadow cursor-pointer disabled:cursor-default appearance-none w-10 h-10 bg-gray-50 border border-gray-300 rounded 
          dark:bg-gray-900 dark:border-0
          disabled:bg-gray-300/50 disabled:dark:bg-gray-500/50
          checked:after:content-['\2713'] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-black checked:after:font-black checked:after:text-4xl 
          checked:after:dark:text-white
          checked:dark:bg-gray-900"
        />
      </div>
    </div>
  );
};

//
