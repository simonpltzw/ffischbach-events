import { useMsal } from "@azure/msal-react";
import { useState } from "react";

const useToken = () => {
  const [token, setToken] = useState<string>("");
  const { instance, accounts } = useMsal();

  const checkToken = (token: string): boolean => {
    if (token.length) {
      const decode = JSON.parse(atob(token.split(".")[1]));
      if (decode.exp * 1000 < new Date().getTime()) {
        return false;
      }
      return true;
    }
    return false;
  };

  const getToken = async () => {
    const isValid = checkToken(token);

    if (isValid) {
      return token;
    } else {
      await instance.initialize();
      const res = await instance.acquireTokenSilent({
        scopes: ["api://ee995dcc-a9ec-4203-93ea-81b5f8621033/access_as_user"],
        account: accounts[0],
      });

      setToken(res.accessToken);
      return res.accessToken;
    }
  };

  return {
    getToken,
  };
};

export default useToken;
