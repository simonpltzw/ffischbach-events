import * as msal from "@azure/msal-browser";
import { msalConfig } from "../config/authConfig";

export const msalInstance = new msal.PublicClientApplication(msalConfig);
