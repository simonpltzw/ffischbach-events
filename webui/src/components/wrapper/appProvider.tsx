import { FC, HTMLAttributes, useEffect } from "react";
import { AppSettingsProvider } from "../../context/appSettings";
import { EventSettingsProvider } from "../../context/eventSettings";
import { GroupProvider } from "../../context/group";
import Navigation from "@/components/navigation/Navigation";
import { ToastProvider } from "../../context/toast";
import { FilterSettingsProvider } from "@/context/filterSettings";
import { CategoriesProvider } from "@/context/category";
import { useAuth0 } from "@auth0/auth0-react";

export interface AppProviderProps extends HTMLAttributes<HTMLElement> {}

export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (!isLoading && isAuthenticated) {
    return (
      <ToastProvider>
        {isAuthenticated && (
          <AppSettingsProvider>
            <Navigation />
            <GroupProvider>
              <EventSettingsProvider>
                <CategoriesProvider>
                  <FilterSettingsProvider>
                    <div className="relative flex flex-row justify-center md:px-0 px-3">
                      <div className="mx-5 mt-5 border-2 dark:border-0 bg-white dark:bg-gray-800 container rounded-xl">
                        <div className="relative flex flex-col gap-5 p-4 rounded-md">
                          {children}
                        </div>
                      </div>
                    </div>
                  </FilterSettingsProvider>
                </CategoriesProvider>
              </EventSettingsProvider>
            </GroupProvider>
          </AppSettingsProvider>
        )}
      </ToastProvider>
    );
  }
};
