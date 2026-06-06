import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: "#111827",
        cobalt: "#2563eb",
        aqua: "#06b6d4",
        violet: "#7c3aed",
        paper: "#f7f8fb",
        warning: "#f97316"
      },
      boxShadow: {
        crisp: "0 18px 60px rgba(17, 24, 39, 0.13)"
      }
    }
  },
  plugins: []
};

export default config;
