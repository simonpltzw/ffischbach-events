"use client";

import { FC, HTMLAttributes } from "react";
import { AppProvider } from "./appProvider";
import { Auth0Provider } from "@auth0/auth0-react";

export interface AppWrapperProps extends HTMLAttributes<HTMLElement> {}

export const AppWrapper: FC<AppWrapperProps> = ({ children }) => {
  return (
    <Auth0Provider
      domain="dev-ow0eeengm8qeok37.eu.auth0.com"
      clientId="fDFlPlPdtfKA4DY31cx76r0IwwYJRs5Y"
      authorizationParams={{ redirect_uri: "http://localhost:3000" }}
    >
      <AppProvider>{children}</AppProvider>
    </Auth0Provider>
  );
};
