"use client";

import { AppSettingsProvider } from "@/context/appSettings";
import "./globals.css";
import { LayoutContent } from "./layoutContent";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <AppSettingsProvider>
        <LayoutContent>{children}</LayoutContent>
      </AppSettingsProvider>
    </html>
  );
}
