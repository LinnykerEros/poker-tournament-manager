import { createContext, useContext, useState, useEffect } from "react";

const themes = {
  dark: {
    pageBg: "linear-gradient(170deg, #0a0a0a 0%, #111111 40%, #1a1a1a 100%)",
    bodyBg: "#0a0a0a",
    text: "#e8e8f0",
    textMuted: "#6a6a82",
    textInactive: "#a0a0b8",
    textEmpty: "#4a4a62",
    containerBg: "rgba(255,255,255,0.02)",
    rowBg: "rgba(255,255,255,0.03)",
    statBg: "rgba(255,255,255,0.04)",
    activeBg: "rgba(255,255,255,0.05)",
    inputBg: "rgba(255,255,255,0.06)",
    borderLight: "rgba(255,255,255,0.03)",
    borderSubtle: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.06)",
    borderMedium: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.1)",
    circleTrack: "rgba(255,255,255,0.05)",
    suitNonRed: "#fff",
    logoFilter: "drop-shadow(0 0 12px rgba(220,38,38,0.4))",
  },
  light: {
    pageBg: "linear-gradient(170deg, #f0f0f0 0%, #f5f5f5 40%, #ebebeb 100%)",
    bodyBg: "#f0f0f0",
    text: "#1a1a1a",
    textMuted: "#6b7280",
    textInactive: "#9ca3af",
    textEmpty: "#b0b0b0",
    containerBg: "rgba(255,255,255,0.7)",
    rowBg: "rgba(0,0,0,0.025)",
    statBg: "rgba(0,0,0,0.03)",
    activeBg: "rgba(0,0,0,0.04)",
    inputBg: "rgba(0,0,0,0.05)",
    borderLight: "rgba(0,0,0,0.06)",
    borderSubtle: "rgba(0,0,0,0.08)",
    border: "rgba(0,0,0,0.1)",
    borderMedium: "rgba(0,0,0,0.13)",
    borderStrong: "rgba(0,0,0,0.15)",
    circleTrack: "rgba(0,0,0,0.08)",
    suitNonRed: "#ccc",
    logoFilter: "drop-shadow(0 0 8px rgba(220,38,38,0.3))",
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem("2z-theme") || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    document.body.style.background = themes[mode].bodyBg;
    try { localStorage.setItem("2z-theme", mode); } catch {}
  }, [mode]);

  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ t: themes[mode], mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
