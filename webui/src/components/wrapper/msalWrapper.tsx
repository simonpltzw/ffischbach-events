"use client";

import { msalConfig } from "@/config/authConfig";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { FC, HTMLAttributes, useMemo } from "react";

export interface MsalWrapper extends HTMLAttributes<HTMLElement> {}

export const MsalWrapper: FC<MsalWrapper> = ({ children }) => {
  const msalInstance = useMemo(() => new PublicClientApplication(msalConfig), []);

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
