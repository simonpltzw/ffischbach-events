import "./globals.css";
import { AppProvider } from "@/components/wrapper/appProvider";
import { AppWrapper } from "@/components/wrapper/appWrapper";
import { MsalWrapper } from "@/components/wrapper/msalWrapper";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`bg-white text-black dark:text-white dark:bg-gray-700 pb-10`}>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
