/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        rc: {
          bg: "#1a1a2e",
          surface: "#222244",
          card: "#2a2a4a",
          border: "#3a3a5c",
          borderLight: "#4a4a6a",
          text: "#e2e2f0",
          textMuted: "#9393b0",
          textDim: "#6a6a8a",
          accent: "#6c5ce7",
          accentHover: "#7c6cf7",
          green: "#00d2a0",
          greenBg: "rgba(0, 210, 160, 0.1)",
          orange: "#ff9f43",
          orangeBg: "rgba(255, 159, 67, 0.1)",
          red: "#ff6b6b",
          redBg: "rgba(255, 107, 107, 0.1)",
          cyan: "#0abde3",
          cyanBg: "rgba(10, 189, 227, 0.1)",
        },
        sidebar: {
          bg: "#16162e",
          hover: "#2a2a4a",
          active: "#6c5ce7",
          text: "#8888aa",
          textActive: "#ffffff",
        },
        surface: {
          primary: "#222244",
          secondary: "#1a1a2e",
          border: "#3a3a5c",
        },
      },
    },
  },
  plugins: [],
};
