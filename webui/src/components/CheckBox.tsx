"use client";

import { ChangeEvent, FC, useEffect, useEffectEvent, useState } from "react";

export interface CheckBoxProps extends React.HTMLAttributes<HTMLInputElement> {
  value: boolean;
  title?: string;
  size?: number;
  disabled?: boolean;
  labelClassName?: string;
}

export const CheckBox: FC<CheckBoxProps> = (props: CheckBoxProps) => {
  const [value, setValue] = useState<boolean>(props.value);

  const onUpdateValue = useEffectEvent(() => setValue(props.value));

  useEffect(() => onUpdateValue(), [props.value]);

  return (
    <div className="flex flex-col">
      {props.title && (
        <label
          className={`block text-sm font-semibold h-fit mb-1 ${props.labelClassName}`}
        >
          {props.title}
        </label>
      )}
      <div className="flex items-center w-8 h-8 shadow-md">
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
          className="relative shadow-inner cursor-pointer disabled:cursor-default appearance-none w-8 h-8 bg-white border rounded
          dark:bg-gray-900 dark:border-0
          hover:bg-gray-100 dark:hover:bg-gray-700
          disabled:bg-gray-300/50 dark:disabled:bg-gray-500/50
          checked:after:content-['\2713'] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-black checked:after:font-black checked:after:text-4xl
          dark:checked:after:text-white
          dark:checked:bg-gray-900"
        />
      </div>
    </div>
  );
};
