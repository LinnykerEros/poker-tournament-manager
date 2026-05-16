import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../theme.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import CardSuitBg from "./shared/CardSuitBg.jsx";

export default function Layout() {
  const { t, mode, toggle } = useTheme();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.pageBg,
        color: t.text,
        fontFamily: "'Fira Mono', 'Courier New', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <CardSuitBg />
      <div style={{ position: "relative", zIndex: 1 }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: `1px solid ${t.borderLight}`,
            background: t.containerBg,
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!isHome && (
              <button
                onClick={() => navigate("/")}
                style={{
                  background: "none",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "4px",
                }}
              >
                ←
              </button>
            )}
            <div
              onClick={() => navigate("/")}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
            >
              <img
                src="/logo.png"
                alt="2Z Poker"
                style={{ width: "32px", height: "auto", filter: t.logoFilter }}
              />
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #dc2626, #ef4444)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "1px",
                }}
              >
                2Z POKER
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={toggle}
              style={{
                background: "none",
                border: "none",
                color: t.textMuted,
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
                opacity: 0.6,
              }}
              title={mode === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {mode === "dark" ? "☀️" : "🌙"}
            </button>
            {profile && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                  />
                )}
                <span style={{ color: t.textMuted, fontSize: "12px", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile.display_name}
                </span>
                <button
                  onClick={signOut}
                  style={{
                    background: "none",
                    border: `1px solid ${t.borderMedium}`,
                    color: t.textMuted,
                    cursor: "pointer",
                    fontSize: "11px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontFamily: "'Fira Mono', monospace",
                  }}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>

        <main style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 16px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
