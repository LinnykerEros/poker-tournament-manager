import { useTheme } from "../../theme.jsx";
import MiniBtn from "./MiniBtn.jsx";
import { PLACE_MEDALS } from "../../utils/constants.js";
import { formatChips } from "../../utils/formatters.js";

export default function PlayerCard({ player, onRemove, onEliminate, onAddOn, onRebuy, eliminated, readOnly = false }) {
  const { t } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        background: eliminated ? t.rowBg : t.activeBg,
        border: `1px solid ${eliminated ? t.borderLight : "rgba(220,38,38,0.15)"}`,
        borderRadius: "12px",
        opacity: eliminated ? 0.5 : 1,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: eliminated ? t.activeBg : "linear-gradient(135deg, #dc2626, #ef4444)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "14px",
          color: eliminated ? t.textMuted : "#ffffff",
          fontFamily: "'Fira Mono', monospace",
          flexShrink: 0,
        }}
      >
        {eliminated
          ? player.place <= 3
            ? PLACE_MEDALS[player.place - 1]
            : `#${player.place}`
          : player.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: "100px" }}>
        <div
          style={{
            color: eliminated ? t.textMuted : t.text,
            fontWeight: 700,
            fontSize: "14px",
            fontFamily: "'Fira Mono', monospace",
            textDecoration: eliminated ? "line-through" : "none",
          }}
        >
          {player.name}
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "2px", flexWrap: "wrap" }}>
          <span style={{ color: "#dc2626", fontSize: "12px", fontFamily: "'Fira Mono', monospace" }}>
            🪙 {formatChips(player.stack)}
          </span>
          {player.addOns > 0 && (
            <span style={{ color: "#60a5fa", fontSize: "11px", fontFamily: "'Fira Mono', monospace" }}>
              +{player.addOns} add-on
            </span>
          )}
          {player.rebuys > 0 && (
            <span style={{ color: "#a78bfa", fontSize: "11px", fontFamily: "'Fira Mono', monospace" }}>
              +{player.rebuys} rebuy
            </span>
          )}
          {player.place && (
            <span
              style={{
                color: "#f59e0b",
                fontSize: "11px",
                fontFamily: "'Fira Mono', monospace",
                fontWeight: 700,
              }}
            >
              {player.place}º lugar
            </span>
          )}
        </div>
      </div>
      {!readOnly && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {!eliminated && (
            <>
              <MiniBtn label="Add-on" color="#60a5fa" onClick={() => onAddOn(player.id)} />
              <MiniBtn label="Rebuy" color="#a78bfa" onClick={() => onRebuy(player.id)} />
            </>
          )}
          <MiniBtn
            label={eliminated ? "Restaurar" : "Eliminar"}
            color={eliminated ? "#34d399" : "#ef4444"}
            onClick={() => onEliminate(player.id)}
          />
          <MiniBtn label="✕" color="#6a6a82" onClick={() => onRemove(player.id)} />
        </div>
      )}
    </div>
  );
}
