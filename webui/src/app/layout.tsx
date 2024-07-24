"use client";

import { AppSettingsProvider } from "@/context/appSettings";
import "./globals.css";
import { LayoutContent } from "./layoutContent";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <AppSettingsProvider>
        <LayoutContent>
          <div className="relative flex flex-row justify-center">
            <div className="mx-5 mt-5 border border-2 dark:border-0 bg-white dark:bg-gray-800 h-fit w-full md:w-[80%] md:w-max-80 rounded">
              <div className="relative flex flex-col gap-10 p-4 rounded-md">{children}</div>
            </div>
          </div>
        </LayoutContent>
      </AppSettingsProvider>
    </html>
  );
}
