"use client";

import { FC, HTMLAttributes } from "react";
import { AppProvider } from "./appProvider";
import { Auth0Provider } from "@auth0/auth0-react";

export interface AppWrapperProps extends HTMLAttributes<HTMLElement> {
  clientId: string;
  domain: string;
}

export const AppWrapper: FC<AppWrapperProps> = ({ children, clientId, domain }) => {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: process.env["NEXT_PUBLIC_REDIRECT_URI"], scope: "access", audience: process.env["NEXT_PUBLIC_WEB_API"] }}
    >
      <AppProvider>{children}</AppProvider>
    </Auth0Provider>
  );
};
