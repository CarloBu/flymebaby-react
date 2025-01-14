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
    <div className="z-50 flex scale-100 select-none items-center gap-2 transition-all duration-300 ease-pop will-change-transform [backface-visibility:hidden] [transform-style:preserve-3d] hover:scale-[1.04] active:scale-95">
      <button
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle theme"
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 ${
          isDark ? "bg-gray-100" : "bg-gray-900"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform dark:bg-gray-900 ${
            isDark ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};
