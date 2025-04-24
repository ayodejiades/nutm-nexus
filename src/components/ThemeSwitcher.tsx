"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
     return <div className="w-8 h-8 sm:w-9 sm:h-9"></div>; 
  }

  const isDarkMode = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <button
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900 transition-colors"
    >
      {isDarkMode ? (
        <SunIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      ) : (
        <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};