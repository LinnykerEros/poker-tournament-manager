import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme.jsx";

export default function NotFoundPage() {
  const { t } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🃏</div>
      <h1 style={{ color: t.text, fontSize: "24px", fontWeight: 900, margin: "0 0 8px" }}>
        404
      </h1>
      <p style={{ color: t.textMuted, fontSize: "14px", margin: "0 0 24px" }}>
        Página não encontrada
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 24px",
          background: "linear-gradient(135deg, #dc2626, #ef4444)",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: 800,
          fontFamily: "'Fira Mono', monospace",
          fontSize: "13px",
        }}
      >
        VOLTAR AO INÍCIO
      </button>
    </div>
  );
}
