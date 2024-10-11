import { FC, HTMLAttributes } from "react";
import { AppSettingsProvider } from "../../context/appSettings";
import { EventSettingsProvider } from "../../context/eventSettings";
import { GroupProvider } from "../../context/group";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import Navigation from "@/components/navigation/Navigation";
import { ToastProvider } from "../../context/toast";
import SignIn from "@/components/pages/SigninPage";
import { FilterSettingsProvider } from "@/context/filterSettings";

export interface AppProviderProps extends HTMLAttributes<HTMLElement> {}

export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  return (
    <ToastProvider>
      {/*<Callback />*/}
      <AuthenticatedTemplate>
        <AppSettingsProvider>
          <Navigation />
          <GroupProvider>
            <EventSettingsProvider>
              <FilterSettingsProvider>
                <div className="relative flex flex-row justify-center md:px-0 px-3">
                  <div className="mx-5 mt-5 border border-2 dark:border-0 bg-white dark:bg-gray-800 container rounded-xl">
                    <div className="relative flex flex-col gap-5 p-4 rounded-md">{children}</div>
                  </div>
                </div>
              </FilterSettingsProvider>
            </EventSettingsProvider>
          </GroupProvider>
        </AppSettingsProvider>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <SignIn />
      </UnauthenticatedTemplate>
    </ToastProvider>
  );
};
