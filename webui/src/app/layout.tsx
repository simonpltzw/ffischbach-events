"use client";

import "./globals.css";
import { MsalProvider } from "@azure/msal-react";
import { useMemo } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../config/authConfig";
import SessionProvider from "@/components/SessionProvider";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const msalInstance = useMemo(() => new PublicClientApplication(msalConfig), []);

  return (
    <html lang="en">
      <body className={" dark:text-white"}>
        <MsalProvider instance={msalInstance}>
          <SessionProvider>{children}</SessionProvider>
        </MsalProvider>
      </body>
    </html>
  );
}
