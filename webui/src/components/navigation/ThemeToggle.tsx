import { useAppSettings } from "@/context/appSettings";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { FC, useEffect } from "react";

export const ThemeToggle: FC<any> = () => {
  const [appSettings, setAppSettings] = useAppSettings();

  const getTheme = (v: boolean) => {
    return v ? "dark" : "light";
  };

  useEffect(() => {
    toggle(!appSettings.isDarkMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (value: boolean) => {
    const currentTheme = localStorage.getItem("theme") == "dark" ? "dark" : "light";
    const theme = getTheme(value);

    const root = window.document.documentElement;

    root.classList.remove(currentTheme);
    root.classList.add(theme);

    localStorage.setItem("theme", theme);

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
        <SunIcon height={22} onClick={() => toggle(false)} />
      ) : (
        <MoonIcon height={22} onClick={() => toggle(true)} />
      )}
    </div>
  );
};
