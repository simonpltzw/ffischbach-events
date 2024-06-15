import { AccountInfo, AuthenticationResult, IPublicClientApplication } from "@azure/msal-browser";

/*export class TokenService {
  private static instance: TokenService

  private constructor(public instance: IPublicClientApplication, account: AccountInfo) {

  }

  

  getToken = async () => {

  }
}*/

export const getToken = async (
  instance: IPublicClientApplication,
  account: AccountInfo
): Promise<AuthenticationResult> => {
    await instance.initialize()
    return instance.acquireTokenSilent({
      scopes: ["api://ee995dcc-a9ec-4203-93ea-81b5f8621033/access_as_user"],
      account,
    });
};
