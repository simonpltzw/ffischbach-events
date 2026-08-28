import React, { FC, HTMLAttributes } from "react";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "@/components/Button";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";

export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  setVisible(): void;
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

const Navigation: FC<NavigationProps> = (props: NavigationProps) => {
  const { logout, loginWithRedirect, isAuthenticated } = useAuth0()
  const router = useRouter();
  const pathname = usePathname();

  const backVisible = () => {
    return pathname != "/";
  };

  return (
    <div className="mx-auto container dark:text-white text-black">
      <div className="relative flex h-16 gap-3 mx-3 items-center justify-between">
        {/*<SidebarBurger toggle={props.setVisible} />*/}
        <div className="flex flex-1 items-center justify-start sm:items-stretch sm:justify-start truncate">
          <div className="flex flex-row gap-3 flex-shrink-0 items-center">
            {backVisible() && (
              <div>
                <ChevronLeftIcon
                  className="cursor-pointer"
                  height={25}
                  onClick={() => router.back()}
                />
              </div>
            )}
            <Link className="shrink" href={"/"}>
              <div className="w-auto text-center text-xl cursor-pointer select-none ">
                Freiwillige Feuerwehr Fischbach Event-Management
              </div>
            </Link>
          </div>
          {/*<div className="hidden sm:ml-6 sm:block">
            <Links
              setVisible={props.setVisible}
              active={0}
              className="flex space-x-4"
              setActive={props.setActive}
            />
          </div>*/}
        </div>
        {<ThemeToggle />}
        <div>
          {isAuthenticated ? (
            <Button
              color="blue"
              type="button"
              onClick={() => logout({logoutParams: {returnTo: "/"}})}
            >
              Abmelden
            </Button>
          ) : (
            <Button
              color="gray"
              type="button"
              styletype="secondary"
              onClick={() => loginWithRedirect()}
            >
              Anmelden
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
