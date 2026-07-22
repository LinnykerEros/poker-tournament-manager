import { useTheme } from "../../theme.jsx";
import NumInput from "../shared/NumInput.jsx";
import { PLACE_MEDALS } from "../../utils/constants.js";
import { formatMoney } from "../../utils/formatters.js";
import { goldBtn } from "../../styles/shared.js";

export default function ConfigTab({ config, setConfig, prizeStructure, setPrizeStructure, players, readOnly = false }) {
  const { t } = useTheme();
  const update = (field, val) =>
    setConfig((prev) => ({ ...prev, [field]: Math.max(0, Number(val) || 0) }));
  const updatePrize = (i, val) =>
    setPrizeStructure((prev) =>
      prev.map((p, idx) =>
        idx === i ? { ...p, percent: Math.max(0, Math.min(100, Number(val) || 0)) } : p
      )
    );
  const addPrizePlace = () =>
    setPrizeStructure((prev) => [...prev, { place: prev.length + 1, percent: 0 }]);
  const removePrizePlace = (i) =>
    setPrizeStructure((prev) =>
      prev.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, place: idx + 1 }))
    );

  const totalPrizePercent = prizeStructure.reduce((s, p) => s + p.percent, 0);
  const totalBuyIns = players.length * config.buyIn;
  const totalAddOns = players.reduce((s, p) => s + p.addOns, 0) * config.addOnCost;
  const totalRebuys = players.reduce((s, p) => s + p.rebuys, 0) * config.rebuyCost;
  const totalStartChips =
    players.filter((p) => p.hasStartChip).length * (config.startChipCost || 0);
  const totalPrizePool = totalBuyIns + totalAddOns + totalRebuys + totalStartChips;

  const fields = [
    { key: "startingStack", label: "Stack Inicial", icon: "🪙" },
    { key: "addOnChips", label: "Fichas Add-on", icon: "➕" },
    { key: "rebuyChips", label: "Fichas Rebuy", icon: "🔄" },
    { key: "startChipChips", label: "Fichas StartChip", icon: "🎰" },
    { key: "addOnCost", label: "Custo Add-on (R$)", icon: "💰" },
    { key: "rebuyCost", label: "Custo Rebuy (R$)", icon: "💰" },
    { key: "startChipCost", label: "Custo StartChip (R$)", icon: "💰" },
    { key: "buyIn", label: "Buy-in (R$)", icon: "🎫" },
  ];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(160px, 100%), 1fr))",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {fields.map((f) => (
          <div
            key={f.key}
            style={{
              background: t.statBg,
              border: `1px solid ${t.border}`,
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                color: t.textMuted,
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "8px",
                fontFamily: "'Fira Mono', monospace",
                minHeight: "30px",
              }}
            >
              {f.icon} {f.label}
            </div>
            {readOnly ? (
              <div style={{
                width: "100%",
                padding: "10px 12px",
                background: t.inputBg,
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "18px",
                fontWeight: 700,
                fontFamily: "'Fira Mono', monospace",
                boxSizing: "border-box",
              }}>
                {config[f.key] ?? 0}
              </div>
            ) : (
              <input
                type="number"
                value={config[f.key] ?? 0}
                onChange={(e) => update(f.key, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: t.inputBg,
                  border: "1px solid rgba(220,38,38,0.2)",
                  borderRadius: "8px",
                  color: "#dc2626",
                  fontSize: "18px",
                  fontWeight: 700,
                  fontFamily: "'Fira Mono', monospace",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#dc2626",
              fontSize: "16px",
              fontFamily: "'Fira Mono', monospace",
              fontWeight: 800,
            }}
          >
            🏆 ESTRUTURA DE PREMIAÇÃO
          </h3>
          {!readOnly && (
            <button onClick={addPrizePlace} style={{ ...goldBtn, fontSize: "11px", padding: "8px 14px" }}>
              + LUGAR
            </button>
          )}
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(220,38,38,0.1), rgba(220,38,38,0.05))",
            border: "1px solid rgba(220,38,38,0.2)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: t.textMuted,
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "4px",
              fontFamily: "'Fira Mono', monospace",
            }}
          >
            Prize Pool Total
          </div>
          <div
            style={{
              color: "#dc2626",
              fontSize: "clamp(22px, 7vw, 32px)",
              fontWeight: 900,
              fontFamily: "'Fira Mono', monospace",
            }}
          >
            {formatMoney(totalPrizePool)}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: t.textMuted, fontSize: "11px", fontFamily: "'Fira Mono', monospace" }}>
              Buy-ins: {formatMoney(totalBuyIns)}
            </span>
            <span style={{ color: t.textMuted, fontSize: "11px", fontFamily: "'Fira Mono', monospace" }}>
              Add-ons: {formatMoney(totalAddOns)}
            </span>
            <span style={{ color: t.textMuted, fontSize: "11px", fontFamily: "'Fira Mono', monospace" }}>
              Rebuys: {formatMoney(totalRebuys)}
            </span>
            <span style={{ color: t.textMuted, fontSize: "11px", fontFamily: "'Fira Mono', monospace" }}>
              StartChips: {formatMoney(totalStartChips)}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {prizeStructure.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: t.rowBg,
                border: `1px solid ${t.border}`,
                borderRadius: "10px",
                padding: "12px 16px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "20px", width: "32px", textAlign: "center" }}>
                {i < 3 ? PLACE_MEDALS[i] : `${p.place}º`}
              </span>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                {readOnly ? (
                  <span style={{ color: "#dc2626", fontSize: "14px", fontWeight: 700, fontFamily: "'Fira Mono', monospace" }}>{p.percent}</span>
                ) : (
                  <NumInput value={p.percent} onChange={(v) => updatePrize(i, v)} />
                )}
                <span style={{ color: t.textMuted, fontSize: "13px", fontFamily: "'Fira Mono', monospace" }}>
                  %
                </span>
              </div>
              <span
                style={{
                  color: "#34d399",
                  fontSize: "14px",
                  fontWeight: 700,
                  fontFamily: "'Fira Mono', monospace",
                  minWidth: "100px",
                  textAlign: "right",
                }}
              >
                {formatMoney((totalPrizePool * p.percent) / 100)}
              </span>
              {!readOnly && (
                <button
                  onClick={() => removePrizePlace(i)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {totalPrizePercent !== 100 && prizeStructure.length > 0 && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              background: totalPrizePercent > 100 ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
              border: `1px solid ${totalPrizePercent > 100 ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
              borderRadius: "8px",
              color: totalPrizePercent > 100 ? "#ef4444" : "#f59e0b",
              fontSize: "12px",
              fontFamily: "'Fira Mono', monospace",
            }}
          >
            ⚠ Total: {totalPrizePercent}% —{" "}
            {totalPrizePercent > 100 ? "excede" : "falta"} {Math.abs(100 - totalPrizePercent)}%
          </div>
        )}
      </div>
    </div>
  );
}
