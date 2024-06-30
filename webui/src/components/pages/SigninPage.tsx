"use client";

import { loginRequest } from "@/config/authConfig";
import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";

const SignIn = () => {
  const { instance } = useMsal();

  useEffect(() => {
    instance.loginRedirect(loginRequest);
  }, []);

  return <></>;
};

export default SignIn;