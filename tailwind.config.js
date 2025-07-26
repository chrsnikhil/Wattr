/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Monaco",
          "Inconsolata",
          "Roboto Mono",
          "Noto Sans Mono",
          "Droid Sans Mono",
          "Liberation Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        primary: {
          green: "#10b981",
        },
        shadow: {
          gray: "#4a5568",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
      },
      boxShadow: {
        "brutal-sm": "4px 4px 0px 0px #4a5568",
        "brutal-md": "8px 8px 0px 0px #4a5568",
        "brutal-lg": "12px 12px 0px 0px #4a5568",
        "brutal-xl": "16px 16px 0px 0px #4a5568",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
