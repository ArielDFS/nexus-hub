import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050A14",
        surface: "#0D1B2A",
        "surface-2": "#112233",
        border: "#1E3A5F",
        cyan: "#00F5FF",
        violet: "#7B2FBE",
        "red-alert": "#FF4C4C",
        gold: "#FFD700",
        text: "#C9D6DF",
        "text-muted": "#5A7A94",
        "text-dim": "#2E4A63",
      },
      fontFamily: {
        display: ["var(--font-display)", "monospace"],
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 245, 255, 0.3)",
        "glow-violet": "0 0 20px rgba(123, 47, 190, 0.3)",
        "glow-gold": "0 0 15px rgba(255, 215, 0, 0.4)",
      },
      keyframes: {
        "pulse-cyan": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0,245,255,0.3)" },
          "50%": { boxShadow: "0 0 24px rgba(0,245,255,0.6)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "hologram-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "pulse-cyan": "pulse-cyan 2s ease-in-out infinite",
        "scan-line": "scan-line 3s linear infinite",
        "float-up": "float-up 0.6s ease-out forwards",
        "hologram-in": "hologram-in 0.4s ease-out forwards",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
