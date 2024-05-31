"use client";

import { FC, HTMLAttributes } from "react";
import SessionProvider from "./SessionProvider";

export interface LayoutWrapperProps extends HTMLAttributes<HTMLElement> {}

const LayoutWrapper: FC<LayoutWrapperProps> = (props: LayoutWrapperProps) => {
  return (
    <div>
      <SessionProvider>{props.children}</SessionProvider>
    </div>
  );
};

export default LayoutWrapper;
