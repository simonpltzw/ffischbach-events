import { useAppSettings } from "@/context/appSettings";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { FC, useEffect, useState } from "react";

export const ThemeToggle: FC<any> = () => {
  const [isDarkMode, setDarkMode] = useState<boolean>(false);
  const [, setAppSettings] = useAppSettings();

  useEffect(() => {
    setAppSettings((settings) => {
      return {
        ...settings,
        isDarkMode,
      };
    });
  });

  return (
    <div>
      {isDarkMode ? (
        <SunIcon height={20} onClick={() => setDarkMode(false)} />
      ) : (
        <MoonIcon height={20} onClick={() => setDarkMode(true)} />
      )}
    </div>
  );
};
