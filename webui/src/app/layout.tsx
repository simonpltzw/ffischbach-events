"use client";

import { AppSettingsProvider } from "@/context/appSettings";
import "./globals.css";
import { LayoutContent } from "./layoutContent";
import { EventSettingsProvider } from "@/context/eventSettingsContext";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <AppSettingsProvider>
        <EventSettingsProvider>
          <LayoutContent>
            <div className="relative flex flex-row justify-center md:px-0 px-3">
              <div className="mx-5 mt-5 border border-2 dark:border-0 bg-white dark:bg-gray-800 container rounded-xl">
                <div className="relative flex flex-col gap-5 p-4 rounded-md">{children}</div>
              </div>
            </div>
          </LayoutContent>
        </EventSettingsProvider>
      </AppSettingsProvider>
    </html>
  );
}
