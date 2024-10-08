"use client";
import { useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { NavigationProvider } from "@/context/navigation";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(0);

  const toggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <nav className="bg-gray-300 dark:bg-gray-800 mb-4">
      <NavigationProvider>
        <Navbar setVisible={toggle} active={activeRoute} setActive={setActiveRoute} />
        <Sidebar
          visible={isOpen}
          setVisible={toggle}
          active={activeRoute}
          setActive={setActiveRoute}
        />
      </NavigationProvider>
    </nav>
  );
};

export default Navigation;
