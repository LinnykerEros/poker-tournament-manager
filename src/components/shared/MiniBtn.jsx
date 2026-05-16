export default function MiniBtn({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px",
        background: `${color}18`,
        color,
        border: `1px solid ${color}40`,
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: 600,
        fontFamily: "'Fira Mono', monospace",
      }}
    >
      {label}
    </button>
  );
}
