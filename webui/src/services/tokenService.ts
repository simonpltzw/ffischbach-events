import { useAuth0 } from "@auth0/auth0-react";

const useToken = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getToken = async () => {
    const token = await getAccessTokenSilently();
    return token;
  };

  return {
    getToken,
  };
};

export default useToken;
