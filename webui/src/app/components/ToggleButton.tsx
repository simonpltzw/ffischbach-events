'use client'

import { FC, HTMLAttributes, useEffect, useRef, useState } from "react";

export interface ToggleButtonProps extends HTMLAttributes<HTMLElement> {
  dispatch: any;
  index: number;
}

export const ToggleButton: FC<ToggleButtonProps> = (props: ToggleButtonProps) => {
  const [value, setValue] = useState<boolean>(false);
  const toggler = useRef<HTMLDivElement>(null);

  const toggle = () => {
    setValue((v) => !v);
  };

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value={value.toString()}
        className="sr-only peer"
        onChange={(e) => {
          props.dispatch({ type: "updateApproved", value: e.target.value, index: props.index });
        }}
      />
      <div
        onClick={toggle}
        ref={toggler}
        className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-0 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
      ></div>
    </label>
  );
};
