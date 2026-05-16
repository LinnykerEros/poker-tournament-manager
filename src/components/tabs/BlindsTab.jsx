import { useState } from "react";
import { useTheme } from "../../theme.jsx";
import NumInput from "../shared/NumInput.jsx";
import { goldBtn, thStyle, tdStyle } from "../../styles/shared.js";

export default function BlindsTab({ blinds, setBlinds }) {
  const { t } = useTheme();
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const addLevel = () => {
    const levels = blinds.filter((b) => !b.isBreak);
    const len = levels.length;
    if (len >= 2) {
      const prev2 = levels[len - 2];
      const prev1 = levels[len - 1];
      const smallRatio = prev2.small > 0 ? prev1.small / prev2.small : 2;
      const bigRatio = prev2.big > 0 ? prev1.big / prev2.big : 2;
      const newSmall = Math.round((prev1.small * smallRatio) / 25) * 25 || prev1.small * 2;
      const newBig = Math.round((prev1.big * bigRatio) / 25) * 25 || prev1.big * 2;
      const anteRatio = prev2.ante > 0 && prev1.ante > 0 ? prev1.ante / prev2.ante : 0;
      const newAnte =
        prev1.ante > 0
          ? anteRatio > 0
            ? Math.round((prev1.ante * anteRatio) / 25) * 25
            : Math.round((prev1.ante * 1.5) / 25) * 25
          : Math.round((newBig * 0.1) / 25) * 25;
      setBlinds((prev) => [
        ...prev,
        { level: len + 1, small: newSmall, big: newBig, ante: newAnte, duration: prev1.duration },
      ]);
    } else if (len === 1) {
      const prev1 = levels[0];
      setBlinds((prev) => [
        ...prev,
        {
          level: 2,
          small: prev1.small * 2,
          big: prev1.big * 2,
          ante: Math.round((prev1.big * 2 * 0.1) / 25) * 25,
          duration: prev1.duration,
        },
      ]);
    } else {
      setBlinds((prev) => [...prev, { level: 1, small: 25, big: 50, ante: 0, duration: 20 }]);
    }
  };

  const removeLevel = (i) =>
    setBlinds((prev) => {
      const filtered = prev.filter((_, idx) => idx !== i);
      let lvl = 1;
      return filtered.map((b) => (b.isBreak ? b : { ...b, level: lvl++ }));
    });

  const updateField = (i, field, val) =>
    setBlinds((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, [field]: Math.max(0, Number(val) || 0) } : b))
    );

  const addBreak = () =>
    setBlinds((prev) => [...prev, { level: 0, small: 0, big: 0, ante: 0, duration: 10, isBreak: true }]);

  const renumberLevels = (arr) => {
    let lvl = 1;
    return arr.map((b) => (b.isBreak ? b : { ...b, level: lvl++ }));
  };

  const handleDragStart = (i) => {
    if (!blinds[i].isBreak) return;
    setDragIdx(i);
  };
  const handleDragOver = (e, i) => {
    if (dragIdx === null) return;
    e.preventDefault();
    setDragOverIdx(i);
  };
  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    setBlinds((prev) => {
      const newArr = [...prev];
      const [dragged] = newArr.splice(dragIdx, 1);
      newArr.splice(targetIdx, 0, dragged);
      return renumberLevels(newArr);
    });
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={addLevel} style={goldBtn}>
          + NÍVEL
        </button>
        <button
          onClick={addBreak}
          style={{
            ...goldBtn,
            background: "rgba(96,165,250,0.15)",
            color: "#60a5fa",
            border: "1px solid rgba(96,165,250,0.3)",
          }}
        >
          ☕ INTERVALO
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 4px",
            fontFamily: "'Fira Mono', monospace",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr
              style={{
                color: t.textMuted,
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
              }}
            >
              <th style={{ ...thStyle, width: "30px" }}></th>
              <th style={thStyle}>Nível</th>
              <th style={thStyle}>Small</th>
              <th style={thStyle}>Big</th>
              <th style={thStyle}>Ante</th>
              <th style={thStyle}>Min</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {blinds.map((b, i) => (
              <tr
                key={i}
                draggable={b.isBreak}
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
                style={{
                  background:
                    dragOverIdx === i && dragIdx !== null
                      ? "rgba(96,165,250,0.15)"
                      : b.isBreak
                        ? "rgba(96,165,250,0.06)"
                        : t.rowBg,
                  opacity: dragIdx === i ? 0.4 : 1,
                  transition: "background 0.15s, opacity 0.15s",
                  borderTop:
                    dragOverIdx === i && dragIdx !== null
                      ? "2px solid #60a5fa"
                      : "2px solid transparent",
                }}
              >
                <td style={{ ...tdStyle, width: "30px", padding: "6px 4px" }}>
                  {b.isBreak ? (
                    <span
                      style={{
                        cursor: "grab",
                        fontSize: "16px",
                        color: "#60a5fa",
                        userSelect: "none",
                      }}
                      title="Arraste para reposicionar"
                    >
                      ⠿
                    </span>
                  ) : (
                    <span style={{ fontSize: "16px", color: "transparent" }}>⠿</span>
                  )}
                </td>
                <td style={tdStyle}>
                  {b.isBreak ? (
                    <span style={{ color: "#60a5fa", fontWeight: 700 }}>☕ Break</span>
                  ) : (
                    <span style={{ color: "#dc2626", fontWeight: 700 }}>{b.level}</span>
                  )}
                </td>
                {b.isBreak ? (
                  <td colSpan={3} style={{ ...tdStyle, color: "#60a5fa", textAlign: "center" }}>
                    Intervalo
                  </td>
                ) : (
                  <>
                    <td style={tdStyle}>
                      <NumInput value={b.small} onChange={(v) => updateField(i, "small", v)} />
                    </td>
                    <td style={tdStyle}>
                      <NumInput value={b.big} onChange={(v) => updateField(i, "big", v)} />
                    </td>
                    <td style={tdStyle}>
                      <NumInput value={b.ante} onChange={(v) => updateField(i, "ante", v)} />
                    </td>
                  </>
                )}
                <td style={tdStyle}>
                  <NumInput value={b.duration} onChange={(v) => updateField(i, "duration", v)} />
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => removeLevel(i)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: "4px",
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          marginTop: "16px",
          color: t.textMuted,
          fontSize: "11px",
          fontFamily: "'Fira Mono', monospace",
        }}
      >
        Duração total estimada:{" "}
        <span style={{ color: "#dc2626" }}>
          {Math.floor(blinds.reduce((s, b) => s + b.duration, 0) / 60)}h{" "}
          {blinds.reduce((s, b) => s + b.duration, 0) % 60}min
        </span>
      </div>
    </div>
  );
}
