import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid";
import { Dispatch, FC, HTMLAttributes, SetStateAction } from "react";

export interface LockProps extends HTMLAttributes<HTMLElement> {
  isLocked: boolean;
}

export const Lock: FC<LockProps> = (props: LockProps) => {
  return (
    <div
      className="absolute top-0 right-0 m-3"
      //md:top-0 md:-left-16 md:bottom-full md:right-full
      //-bottom-16 right-0
    >
      <div
        className={`rounded-md w-fit h-fit bg-blue-600 -m-0 shadow-md ${
          props.isLocked ? "cursor-pointer hover:bg-blue-500" : ""
        }`}
      >
        {props.isLocked ? (
          <LockClosedIcon className="fill-white p-3 h-14" />
        ) : (
          <LockOpenIcon className="fill-white p-3 h-14" />
        )}
      </div>
    </div>
  );
};
