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
          bg: "#111318",
          surface: "#1a1d24",
          card: "#1e2128",
          border: "#2e3340",
          borderLight: "#3d4455",
          text: "#e1e4ea",
          textMuted: "#9ba3b0",
          textDim: "#6b7280",
          accent: "#3b82f6",
          accentHover: "#60a5fa",
          green: "#34d399",
          greenBg: "rgba(52, 211, 153, 0.1)",
          orange: "#fbbf24",
          orangeBg: "rgba(251, 191, 36, 0.1)",
          red: "#f87171",
          redBg: "rgba(248, 113, 113, 0.1)",
          cyan: "#22d3ee",
          cyanBg: "rgba(34, 211, 238, 0.1)",
        },
        sidebar: {
          bg: "#0d0f13",
          hover: "#1a1d24",
          active: "#3b82f6",
          text: "#8892a4",
          textActive: "#ffffff",
        },
        surface: {
          primary: "#1a1d24",
          secondary: "#111318",
          border: "#2e3340",
        },
      },
    },
  },
  plugins: [],
};
