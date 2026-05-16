import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../theme.jsx";
import CardSuitBg from "../components/shared/CardSuitBg.jsx";

export default function LoginPage() {
  const { session, loading, signInWithGoogle } = useAuth();
  const { t } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate("/", { replace: true });
  }, [session, loading, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.pageBg,
        color: t.text,
        fontFamily: "'Fira Mono', 'Courier New', monospace",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CardSuitBg />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "40px",
          background: t.containerBg,
          border: `1px solid ${t.border}`,
          borderRadius: "20px",
          backdropFilter: "blur(12px)",
          maxWidth: "380px",
          width: "100%",
          margin: "0 16px",
        }}
      >
        <img
          src="/logo.png"
          alt="2Z Poker"
          style={{
            width: "80px",
            height: "auto",
            marginBottom: "16px",
            filter: t.logoFilter,
          }}
        />
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 900,
            margin: "0 0 8px",
            background: "linear-gradient(135deg, #dc2626, #ef4444, #dc2626)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "2px",
          }}
        >
          2Z POKER
        </h1>
        <p style={{ color: t.textMuted, fontSize: "13px", margin: "0 0 32px" }}>
          Gerenciador de torneios do clube
        </p>
        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "linear-gradient(135deg, #dc2626, #ef4444)",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: 800,
            fontFamily: "'Fira Mono', monospace",
            fontSize: "14px",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          ENTRAR COM GOOGLE
        </button>
      </div>
    </div>
  );
}
