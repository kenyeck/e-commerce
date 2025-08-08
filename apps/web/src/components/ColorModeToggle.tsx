"use client";
import { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { Button } from "@e-commerce/ui";

export function ColorModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isLocalDark = localStorage.getItem("dark-mode") === "true";
    const isSystemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark =
      isLocalDark || (!("dark-mode" in localStorage) && isSystemDark);
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem("dark-mode", JSON.stringify(newDark));
    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  return (
    <Button className="menu-icon" onClick={toggle}>
      {dark ? <FaMoon /> : <FaSun />}
    </Button>
  );
}
