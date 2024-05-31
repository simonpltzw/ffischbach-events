"use client";

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./config/authConfig";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const { instance } = useMsal();
  const router = useRouter()

  return (
    <div className="flex items-center justify-center h-screen">
      <button className="rounded-md p-3 dark:bg-gray-800" onClick={() => instance.loginRedirect(loginRequest)}>Sign in</button>
    </div>
  );
};

export default SignIn;
