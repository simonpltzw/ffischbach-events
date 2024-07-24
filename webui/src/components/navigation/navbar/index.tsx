import { loginRequest, logoutRequest } from "@/config/authConfig";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React, { FC, HTMLAttributes } from "react";
import SidebarBurger from "../sidebar/burger";
import { Links } from "../Links";
import { ThemeToggle } from "../ThemeToggle";

export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  setVisible(): void;
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

const Navigation: FC<NavigationProps> = (props: NavigationProps) => {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 dark:text-white text-black">
      <div className="relative flex h-16 gap-3 items-center justify-between">
        <SidebarBurger toggle={props.setVisible} />
        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div className="flex flex-shrink-0 items-center">
            <div className="w-auto my-auto text-center">FF-Fischbach</div>
          </div>
          <div className="hidden sm:ml-6 sm:block">
            <Links active={0} className="flex space-x-4" setActive={props.setActive} />
          </div>
        </div>
        <ThemeToggle/>       
        <div>
          {isAuthenticated ? (
            <button
              className="relative rounded-md p-1 dark:bg-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              onClick={() => instance.logoutRedirect(logoutRequest)}
            >
              Sign out
            </button>
          ) : (
            <button
              className="relative rounded-md p-1 dark:bg-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              onClick={() => instance.loginRedirect(loginRequest)}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
