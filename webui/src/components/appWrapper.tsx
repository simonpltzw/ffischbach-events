'use client'

import { FC, HTMLAttributes } from "react";
import { AppProvider } from "./wrapper/appProvider";
import { MsalWrapper } from "./wrapper/msalWrapper";

export interface AppWrapperProps extends HTMLAttributes<HTMLElement> {}

export const AppWrapper: FC<AppWrapperProps> = ({ children }) => {
  return (
    <MsalWrapper>
      <AppProvider>{children}</AppProvider>
    </MsalWrapper>
  );
};
