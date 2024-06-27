/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EndSessionRequest, PopupRequest, stubbedPublicClientApplication } from "@azure/msal-browser";

/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */

export const msalConfig = {
    auth: {
        clientId: 'b2524bda-98bb-4568-a36d-831fa67efac2',
        authority: 'https://login.microsoftonline.com/a21b658e-30c5-4bc5-8409-1729b686c215',
        redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
        
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
};

//b2524bda-98bb-4568-a36d-831fa67efac2
//b2524bda-98bb-4568-a36d-831fa67efac2

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest: PopupRequest  = {
    scopes: ["User.Read"],
    redirectUri: "http://localhost:3000"
};

export const logoutRequest: EndSessionRequest = {
    postLogoutRedirectUri: 'http://localhost:3000'
}

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};