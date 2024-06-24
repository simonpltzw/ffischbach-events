"use client";

import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { FC, HTMLAttributes } from "react";
import Navigation from "./navigation/Navigation";
import Callback from "@/app/callback/page";
import { GroupProvider } from "@/context/group";

export interface SessionProviderProps extends HTMLAttributes<HTMLElement> {}

export const SessionProvider: FC<SessionProviderProps> = async (props: SessionProviderProps) => {
  return (
    <div>
      <Navigation />
      <Callback />
      <AuthenticatedTemplate>
        <GroupProvider>{props.children}</GroupProvider>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <></>
      </UnauthenticatedTemplate>
    </div>
  );
};

export default SessionProvider;