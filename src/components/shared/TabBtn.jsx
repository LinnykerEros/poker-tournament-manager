export default function TabBtn({ active, label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: active ? "linear-gradient(135deg, #d4af37, #f5d76e)" : "rgba(255,255,255,0.05)",
        color: active ? "#1a1a2e" : "#a0a0b8",
        border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
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
