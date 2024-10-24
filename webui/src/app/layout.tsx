import localFont from "next/font/local";
import { AppWrapper } from "@/components/wrapper/appWrapper";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black dark:text-white dark:bg-gray-700 pb-10`}>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
