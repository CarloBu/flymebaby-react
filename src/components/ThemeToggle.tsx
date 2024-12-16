import { useState, useEffect } from "react";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const darkModeEnabled =
      savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(darkModeEnabled);
    document.documentElement.classList.toggle("dark", darkModeEnabled);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle theme"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 ${
          isDark ? "bg-gray-100" : "bg-gray-900"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform dark:h-5 dark:w-5 dark:bg-gray-900 ${
            isDark ? "translate-x-[1.3rem]" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};
