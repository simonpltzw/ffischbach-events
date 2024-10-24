import { loginRequest, logoutRequest } from "@/config/authConfig";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React, { FC, HTMLAttributes } from "react";
import SidebarBurger from "../sidebar/burger";
import { Links } from "../Links";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "@/components/Button";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { useRouter, usePathname } from "next/navigation";

export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  setVisible(): void;
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

const Navigation: FC<NavigationProps> = (props: NavigationProps) => {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const pathname = usePathname();

  const backVisible = () => {
    return pathname != "/";
  };

  return (
    <div className="mx-auto container dark:text-white text-black">
      <div className="relative flex h-16 gap-3 items-center justify-between">
        <SidebarBurger toggle={props.setVisible} />
        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div className="flex flex-row gap-3 flex-shrink-0 items-center">
            {backVisible() && (
              <div>
                <ChevronLeftIcon className="cursor-pointer" height={30} onClick={() => router.back()} />
              </div>
            )}
            <div className="w-auto my-auto text-center">FF-Fischbach</div>
          </div>
          <div className="hidden sm:ml-6 sm:block">
            <Links
              setVisible={props.setVisible}
              active={0}
              className="flex space-x-4"
              setActive={props.setActive}
            />
          </div>
        </div>
        <ThemeToggle />
        <div>
          {isAuthenticated ? (
            <Button
            color="blue"
              type="button"
              onClick={() => instance.logoutRedirect(logoutRequest)}
            >
              Sign out
            </Button>
          ) : (
            <Button
            color="gray"
              type="button"
              styletype="secondary"
              onClick={() => instance.loginRedirect(loginRequest)}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
