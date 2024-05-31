"use client";
import { useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(0)

  const toggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <nav className="bg-gray-800">
      <Navbar setVisible={toggle} active={activeRoute} setActive={setActiveRoute}/>
      <Sidebar visible={isOpen} setVisible={toggle} active={activeRoute} setActive={setActiveRoute}/>
    </nav>
  );
};

export default Navigation;
