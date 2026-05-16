import { useTheme } from "../../theme.jsx";

export default function TabBtn({ active, label, icon, onClick }) {
  const { t } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: active ? "linear-gradient(135deg, #dc2626, #ef4444)" : t.activeBg,
        color: active ? "#ffffff" : t.textInactive,
        border: active ? "none" : `1px solid ${t.borderMedium}`,
        borderRadius: "10px",
        cursor: "pointer",
        fontFamily: "'Fira Mono', 'Courier New', monospace",
        fontWeight: active ? 800 : 500,
        fontSize: "13px",
        letterSpacing: "0.5px",
        transition: "all 0.3s",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        textTransform: "uppercase",
      }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      {label}
    </button>
  );
}
