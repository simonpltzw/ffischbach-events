"use client";

import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { FC, HTMLAttributes } from "react";
import { GroupProvider } from "@/context/group";
import Navigation from "./navigation/Navigation";
import SignIn from "./pages/SigninPage";
import { ToastProvider } from "@/context/toast";

export interface SessionProviderProps extends HTMLAttributes<HTMLElement> {}

export const SessionProvider: FC<SessionProviderProps> = (props: SessionProviderProps) => {
  return (
    <div>
      <ToastProvider>
        {/*<Callback />*/}
        <AuthenticatedTemplate>
            <Navigation />
            <GroupProvider>{props.children}</GroupProvider>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <SignIn />
        </UnauthenticatedTemplate>
      </ToastProvider>
    </div>
  );
};

export default SessionProvider;
