"use client";

import { loginRequest } from "@/config/authConfig";
import { useMsal } from "@azure/msal-react";
import { useLayoutEffect } from "react";

const SignIn = () => {
  const { instance } = useMsal();

  useLayoutEffect(() => {
    if (instance) {
      instance.initialize().then(() => instance.loginRedirect(loginRequest));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};

export default SignIn;
