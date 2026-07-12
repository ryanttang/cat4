import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cat4: {
          blue: "#2252d4",
          dark: "#1A1423",
          light: "#fdfdfd",
          primary: "#1A1423",
          surface: "#231c2e",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#2252d4",
          foreground: "#fdfdfd",
        },
        secondary: {
          DEFAULT: "#231c2e",
          foreground: "#fdfdfd",
        },
        muted: {
          DEFAULT: "#2d2438",
          foreground: "#a1a1aa",
        },
        accent: {
          DEFAULT: "#2252d4",
          foreground: "#fdfdfd",
        },
        border: "#3d3548",
        input: "#3d3548",
        ring: "#2252d4",
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fdfdfd",
        },
        card: {
          DEFAULT: "#231c2e",
          foreground: "#fdfdfd",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        sm: ["0.875rem", { lineHeight: "1.4" }],
        base: ["1rem", { lineHeight: "1.45" }],
        lg: ["1.125rem", { lineHeight: "1.5" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
