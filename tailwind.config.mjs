import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    screens: {
      xxsm: "380px",
      xsm: "430px",
      ssm: "515px",
      sm: "651px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
      },
      colors: {
        "orange-custom": "#FF7C1E",
        "orange-custom2": "#e83815",
        "orange-hover-custom": "#FF913E",
        "focus-color": "#737373",
        "selected-color": "#f3f3f3",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      boxShadow: {
        "orange-shadow": "0px 4px 20px rgba(226, 106, 20, 0.25)",
        "orange-hover-shadow": "0px 4px 20px rgba(226, 106, 20, 0.30)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        pop: "cubic-bezier(0.16, 2, 0.68, 0.96)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-thin": {
          "&::-webkit-scrollbar": {
            width: "4px",
            height: "4px",
          },
          "&::-webkit-scrollbar-button": {
            width: "0px",
            height: "0px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            border: "none",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#E2E8F0",
            border: "none",
            borderRadius: "50px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#CBD5E1",
          },
          "&::-webkit-scrollbar-corner": {
            background: "transparent",
          },
          "scrollbar-width": "thin",
          "scrollbar-color": "#E2E8F0 transparent",
        },
      });
    },
    require("tailwindcss-animate"),
    plugin(),
  ],
};
