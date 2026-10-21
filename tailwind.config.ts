import type { Config } from "tailwindcss";

// Գունային գամմա. steel՝ մուգ կապտամոխրագույն հիմք, blaze՝ որսորդական նարնջագույն շեշտ։
const config: Config = {
  darkMode: "class",
  content: ["./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        steel: {
          50: "#f3f5f7",
          100: "#e2e7ec",
          200: "#c5ced8",
          300: "#9dabb9",
          400: "#728396",
          500: "#56677a",
          600: "#435263",
          700: "#344150",
          800: "#26313d",
          900: "#1a222c",
          950: "#10151c",
        },
        blaze: {
          300: "#ffb27a",
          400: "#ff8f45",
          500: "#f4731f",
          600: "#d65b0c",
          700: "#a8460b",
        },
        paper: "#f6f7f8",
        ink: "#12171d",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
