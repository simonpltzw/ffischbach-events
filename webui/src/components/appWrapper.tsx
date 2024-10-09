'use client'

import { FC, HTMLAttributes } from "react";
import { MsalWrapper } from "./msalWrapper";
import { AppProvider } from "./wrapper/appProvider";

export interface AppWrapperProps extends HTMLAttributes<HTMLElement> {}

export const AppWrapper: FC<AppWrapperProps> = ({ children }) => {
  return (
    <MsalWrapper>
      <AppProvider>{children}</AppProvider>
    </MsalWrapper>
  );
};
