import { msalConfig } from "@/config/authConfig";
import * as msal from "@azure/msal-browser";

export const msalInstance = new msal.PublicClientApplication(msalConfig);
