import { Transition } from "@headlessui/react";
import React, { FC, HTMLAttributes } from "react";
import { Links } from "../Links";

export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  active: number
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

const Sidebar: FC<NavigationProps> = (props: NavigationProps) => {
  return (
    <div className="absolute bg-gray-300 dark:bg-gray-800 left-0 right-0 z-40">
      <Transition
      show={props.visible}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <div className="sm:hidden" id="mobile-menu">
        <Links className="flex flex-col gap-4 px-2 pb-3 pt-2" setActive={props.setActive} active={0}/>
      </div>
    </Transition>
    </div>
    
  );
};

export default Sidebar;
