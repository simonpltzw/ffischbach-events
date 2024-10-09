import "./globals.css";
import { AppWrapper } from "@/components/wrapper/appWrapper";

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
