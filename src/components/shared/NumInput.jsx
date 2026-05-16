import { useTheme } from "../../theme.jsx";

export default function NumInput({ value, onChange }) {
  const { t } = useTheme();
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "70px",
        padding: "6px 8px",
        background: t.inputBg,
        border: `1px solid ${t.borderMedium}`,
        borderRadius: "6px",
        color: t.text,
        fontSize: "13px",
        fontFamily: "'Fira Mono', monospace",
        textAlign: "center",
        outline: "none",
      }}
    />
  );
}
