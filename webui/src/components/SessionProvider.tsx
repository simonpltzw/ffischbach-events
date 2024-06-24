"use client";

import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { FC, HTMLAttributes } from "react";
import { GroupProvider } from "@/context/group";
import Navigation from "./navigation/Navigation";
import SignIn from "./pages/SigninPage";

export interface SessionProviderProps extends HTMLAttributes<HTMLElement> {}

export const SessionProvider: FC<SessionProviderProps> = (props: SessionProviderProps) => {
  return (
    <div>
      {/*<Callback />*/}
      <AuthenticatedTemplate>
        <Navigation />
        <GroupProvider>{props.children}</GroupProvider>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <SignIn />
      </UnauthenticatedTemplate>
    </div>
  );
};

export default SessionProvider;
