export default function NumInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "70px",
        padding: "6px 8px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "6px",
        color: "#e8e8f0",
        fontSize: "13px",
        fontFamily: "'Fira Mono', monospace",
        textAlign: "center",
        outline: "none",
      }}
    />
  );
}
