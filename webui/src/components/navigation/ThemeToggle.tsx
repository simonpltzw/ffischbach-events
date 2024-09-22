import { useAppSettings } from "@/context/appSettings";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { FC } from "react";

export const ThemeToggle: FC<any> = () => {
  const [appSettings, setAppSettings] = useAppSettings();

  const toggle = (value: boolean) => {
    localStorage.setItem("theme", value ? "dark" : "light");
    setAppSettings((state) => {
      return {
        ...state,
        isDarkMode: value,
      };
    });
  };

  return (
    <div className="cursor-pointer">
      {appSettings.isDarkMode ? (
        <SunIcon height={20} onClick={() => toggle(false)} />
      ) : (
        <MoonIcon height={20} onClick={() => toggle(true)} />
      )}
    </div>
  );
};
