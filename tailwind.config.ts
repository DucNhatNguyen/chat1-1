import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#08C",
          50: "#E6F7FF",
          100: "#C0ECFF",
          200: "#96E0FF",
          300: "#6BD4FF",
          400: "#41C8FF",
          500: "#17BCFF",
          600: "#08A5E4",
          700: "#0787BA",
          800: "#056A90",
          900: "#034A63"
        }
      }
    }
  },
  plugins: []
} satisfies Config;