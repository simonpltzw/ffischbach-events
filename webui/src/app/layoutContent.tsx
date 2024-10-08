import SessionProvider from "@/components/SessionProvider";
import { msalConfig } from "@/config/authConfig";
import { useAppSettings } from "@/context/appSettings";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { FC, HTMLAttributes, useMemo } from "react";

export interface LayoutContentProps extends HTMLAttributes<HTMLElement> {}

export const LayoutContent: FC<LayoutContentProps> = (props: LayoutContentProps) => {
  const msalInstance = useMemo(() => new PublicClientApplication(msalConfig), []);
  const [appSettings] = useAppSettings();

  return (
    <body className={`${appSettings.isDarkMode ? "dark" : ""}`}>
      <div className="bg-white text-black dark:text-white dark:bg-gray-700 pb-10">
        <MsalProvider instance={msalInstance}>
          <SessionProvider>{props.children}</SessionProvider>
        </MsalProvider>
      </div>
    </body>
  );
};
