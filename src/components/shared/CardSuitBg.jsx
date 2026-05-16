import { SUITS } from "../../utils/constants.js";
import { useTheme } from "../../theme.jsx";

export default function CardSuitBg() {
  const { t } = useTheme();
  const suits = [];
  for (let i = 0; i < 30; i++) {
    suits.push(
      <span
        key={i}
        style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          fontSize: `${14 + Math.random() * 28}px`,
          opacity: 0.04 + Math.random() * 0.04,
          color: SUITS[i % 4] === "♥" || SUITS[i % 4] === "♦" ? "#ef4444" : t.suitNonRed,
          transform: `rotate(${Math.random() * 360}deg)`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {SUITS[i % 4]}
      </span>
    );
  }
  return <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0 }}>{suits}</div>;
}
