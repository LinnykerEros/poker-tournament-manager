export const goldBtn = {
  padding: "10px 20px",
  background: "linear-gradient(135deg, #dc2626, #ef4444)",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 800,
  fontFamily: "'Fira Mono', monospace",
  fontSize: "12px",
  letterSpacing: "0.5px",
};

export const getCtrlBtn = (t) => ({
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: t.inputBg,
  border: `1px solid ${t.borderStrong}`,
  color: t.text,
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const thStyle = {
  padding: "8px 12px",
  textAlign: "center",
  fontFamily: "'Fira Mono', monospace",
};

export const tdStyle = { padding: "6px 8px", textAlign: "center" };
