import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",
        paper: "#F7F8FA",
        surface: "#FFFFFF",
        line: "#E4E6ED",
        muted: "#6B7080",
        teal: {
          DEFAULT: "#0F6B5C",
          light: "#E6F2EF",
        },
        coral: "#FF4D6D",
        amber: "#FF8A3D",
        gold: "#FFB020",
      },
      backgroundImage: {
        pin: "linear-gradient(135deg, #FF4D6D 0%, #FF8A3D 100%)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
