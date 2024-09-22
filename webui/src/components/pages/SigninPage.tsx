"use client";

import { loginRequest } from "@/config/authConfig";
import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";

const SignIn = () => {
  const { instance } = useMsal();

  useEffect(() => {
    if (instance) {
     instance.loginRedirect(loginRequest)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};

export default SignIn;
