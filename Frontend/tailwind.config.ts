import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          canvas: "#F6F8FD",
          "canvas-tint": "#EEF2FE",
          surface: "#FFFFFF",
          "surface-muted": "#F5F7FD",
          "surface-subtle": "#F9FAFE",
          border: "#E2E8F0",
          "border-subtle": "#ECEFF8",
          dark: "#140F35",
          "dark-hover": "#211A4F",
          primary: "#6366F1",
          violet: "#7C3AED",
          cyan: "#0EA5E9",
          blue: "#3B82F6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          text: "#0F172A",
          muted: "#475569",
          subtle: "#94A3B8",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        window:
          "0 32px 70px -15px rgba(30, 20, 80, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)",
        "window-lg":
          "0 40px 90px -20px rgba(30, 20, 90, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9)",
        card: "0 10px 25px -5px rgba(25, 15, 65, 0.04), 0 0 0 1px rgba(238, 242, 250, 0.9)",
        "card-hover":
          "0 18px 36px -6px rgba(99, 102, 241, 0.12), 0 0 0 1px rgba(199, 210, 254, 0.7)",
        floating:
          "0 14px 30px -4px rgba(20, 15, 50, 0.08), 0 2px 6px -1px rgba(20, 15, 50, 0.04)",
        glow: "0 8px 24px -4px rgba(124, 58, 237, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand":
          "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)",
        "gradient-card-border":
          "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(224,231,255,0.4))",
        "ambient-mesh":
          "radial-gradient(at 10% 10%, rgba(224, 231, 255, 0.8) 0px, transparent 50%), radial-gradient(at 90% 15%, rgba(243, 232, 255, 0.8) 0px, transparent 50%), radial-gradient(at 50% 90%, rgba(224, 242, 254, 0.7) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
