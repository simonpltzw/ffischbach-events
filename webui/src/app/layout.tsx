'use client'

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MsalProvider } from "@azure/msal-react";
import { useMemo } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../config/authConfig";
import LayoutWrapper from "@/components/LayoutWrapper";


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const msalInstance = useMemo(() => new PublicClientApplication(msalConfig), []);

  return (
    <html lang="en">
      <body className={" dark:text-white"}>
      <MsalProvider instance={msalInstance}>
        <LayoutWrapper>{children}</LayoutWrapper>
        </MsalProvider>
      </body>
    </html>
  );
}
