import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../theme.jsx";
import { formatTime, formatChips } from "../../utils/formatters.js";
import { getCtrlBtn } from "../../styles/shared.js";

export default function TimerTab({
  blinds,
  players,
  fullscreen,
  setFullscreen,
  currentLevel,
  setCurrentLevel,
  secondsLeft,
  setSecondsLeft,
  running,
  setRunning,
  getAudioCtx,
  readOnly = false,
}) {
  const { t } = useTheme();
  const [flashColor, setFlashColor] = useState(null);
  const prevLevelRef = useRef(currentLevel);
  const ctrlBtn = getCtrlBtn(t);

  useEffect(() => {
    if (running && prevLevelRef.current !== currentLevel) {
      setFlashColor("rgba(220,38,38,0.4)");
      const timers = [
        setTimeout(() => setFlashColor(null), 600),
        setTimeout(() => setFlashColor("rgba(220,38,38,0.3)"), 800),
        setTimeout(() => setFlashColor(null), 1400),
        setTimeout(() => setFlashColor("rgba(220,38,38,0.2)"), 1600),
        setTimeout(() => setFlashColor(null), 2200),
      ];
      prevLevelRef.current = currentLevel;
      return () => timers.forEach(clearTimeout);
    }
    prevLevelRef.current = currentLevel;
  }, [currentLevel, running]);

  const toggleRunning = () => {
    if (!running && getAudioCtx) getAudioCtx();
    setRunning(!running);
  };

  const goToLevel = (i) => {
    setCurrentLevel(i);
    setSecondsLeft(blinds[i].duration * 60);
    setRunning(false);
  };

  const current = blinds[currentLevel];
  const next = blinds[currentLevel + 1];
  const activePlayers = players.filter((p) => !p.eliminated).length;
  const totalChips = players.reduce((s, p) => s + p.stack, 0);
  const avgStack = activePlayers > 0 ? Math.round(totalChips / activePlayers) : 0;
  const progress = current ? 1 - secondsLeft / (current.duration * 60) : 0;
  const isLow = secondsLeft <= 60;
  const isCritical = secondsLeft <= 10;

  return (
    <div style={{ textAlign: "center" }}>
      {flashColor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: flashColor,
            zIndex: 9999,
            pointerEvents: "none",
            transition: "opacity 0.3s",
          }}
        />
      )}
      {current && (
        <>
          <div
            style={{
              marginBottom: fullscreen ? "16px" : "8px",
              color: t.textMuted,
              fontSize: fullscreen ? "16px" : "11px",
              textTransform: "uppercase",
              letterSpacing: "3px",
              fontFamily: "'Fira Mono', monospace",
            }}
          >
            {current.isBreak ? "☕ Intervalo" : `Nível ${current.level}`}
          </div>

          {/* Barra de progresso horizontal */}
          <div
            style={{
              width: "100%",
              height: fullscreen ? "10px" : "6px",
              background: t.circleTrack,
              borderRadius: "5px",
              overflow: "hidden",
              marginBottom: fullscreen ? "32px" : "20px",
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: isCritical ? "#dc2626" : isLow ? "#ef4444" : current.isBreak ? "#60a5fa" : "#dc2626",
                borderRadius: "5px",
                transition: "width 1s linear, background 0.3s",
              }}
            />
          </div>

          {/* Tempo à esquerda + Blinds à direita */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: fullscreen ? "clamp(12px, 2vw, 24px)" : "clamp(8px, 2vw, 16px)",
              marginBottom: fullscreen ? "20px" : "12px",
            }}
          >
            <div style={{ flex: 1, textAlign: "right" }}>
              <span
                style={{
                  fontSize: fullscreen ? "clamp(42px, 10vw, 80px)" : "clamp(28px, 7vw, 42px)",
                  fontWeight: 900,
                  fontFamily: "'Fira Mono', monospace",
                  color: isCritical ? "#dc2626" : isLow ? "#ef4444" : t.text,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  animation: isCritical
                    ? "criticalPulse 0.5s infinite"
                    : isLow
                      ? "pulse 1s infinite"
                      : "none",
                }}
              >
                {formatTime(secondsLeft)}
              </span>
            </div>

            {!current.isBreak && (
              <>
              <span
                style={{
                  color: t.textMuted,
                  fontSize: fullscreen ? "clamp(30px, 7vw, 60px)" : "clamp(20px, 5vw, 32px)",
                  fontWeight: 300,
                  fontFamily: "'Fira Mono', monospace",
                  opacity: 0.3,
                  userSelect: "none",
                  flexShrink: 0,
                }}
              >
                |
              </span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div
                  style={{
                    fontSize: fullscreen ? "clamp(42px, 10vw, 80px)" : "clamp(28px, 7vw, 42px)",
                    fontWeight: 900,
                    fontFamily: "'Fira Mono', monospace",
                    color: "#dc2626",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatChips(current.small)}/{formatChips(current.big)}
                </div>
              </div>
              </>
            )}
          </div>

          {/* Ante atual + Próximo nível centralizados */}
          <div style={{ textAlign: "center", marginBottom: fullscreen ? "28px" : "20px" }}>
            {!current.isBreak && current.ante > 0 && (
              <div style={{ marginBottom: "6px", padding: fullscreen ? "6px 0" : "4px 0" }}>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: fullscreen ? "13px" : "10px",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    fontFamily: "'Fira Mono', monospace",
                  }}
                >
                  Atual →{" "}
                </span>
                <span
                  style={{
                    color: "#a78bfa",
                    fontWeight: 700,
                    fontFamily: "'Fira Mono', monospace",
                    fontSize: fullscreen ? "18px" : "14px",
                  }}
                >
                  Ante: {formatChips(current.ante)}
                </span>
              </div>
            )}
            {next && (
              <div style={{ padding: fullscreen ? "6px 0" : "4px 0" }}>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: fullscreen ? "13px" : "10px",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    fontFamily: "'Fira Mono', monospace",
                  }}
                >
                  Próximo →{" "}
                </span>
                <span
                  style={{
                    color: t.text,
                    fontWeight: 700,
                    fontFamily: "'Fira Mono', monospace",
                    fontSize: fullscreen ? "18px" : "14px",
                  }}
                >
                  {next.isBreak
                    ? "☕ Intervalo"
                    : `${formatChips(next.small)}/${formatChips(next.big)}${next.ante ? ` (Ante: ${formatChips(next.ante)})` : ""}`}
                </span>
              </div>
            )}
          </div>

          {/* Controles */}
          {!readOnly && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => goToLevel(Math.max(0, currentLevel - 1))}
                style={{
                  ...ctrlBtn,
                  ...(fullscreen ? { width: "56px", height: "56px", fontSize: "22px" } : {}),
                }}
                disabled={currentLevel === 0}
              >
                ⏮
              </button>
              <button
                onClick={toggleRunning}
                style={{
                  ...ctrlBtn,
                  width: fullscreen ? "80px" : "64px",
                  height: fullscreen ? "80px" : "64px",
                  fontSize: fullscreen ? "30px" : "24px",
                  background: running ? "rgba(239,68,68,0.2)" : "linear-gradient(135deg, #dc2626, #ef4444)",
                  color: running ? "#ef4444" : "#ffffff",
                  border: running ? "1px solid rgba(239,68,68,0.4)" : "none",
                }}
              >
                {running ? "⏸" : "▶"}
              </button>
              <button
                onClick={() => goToLevel(Math.min(blinds.length - 1, currentLevel + 1))}
                style={{
                  ...ctrlBtn,
                  ...(fullscreen ? { width: "56px", height: "56px", fontSize: "22px" } : {}),
                }}
                disabled={currentLevel >= blinds.length - 1}
              >
                ⏭
              </button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              style={{
                padding: "8px 20px",
                background: fullscreen ? "rgba(239,68,68,0.15)" : t.inputBg,
                color: fullscreen ? "#ef4444" : t.textInactive,
                border: `1px solid ${fullscreen ? "rgba(239,68,68,0.3)" : t.borderStrong}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "'Fira Mono', monospace",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {fullscreen ? "✕ SAIR TELA CHEIA" : "🖥 TELA CHEIA"}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: fullscreen ? "32px" : "24px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Jogadores", value: activePlayers, icon: "👥" },
              { label: "Stack Médio", value: formatChips(avgStack), icon: "📊" },
              { label: "Total Chips", value: formatChips(totalChips), icon: "🪙" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: fullscreen ? "20px" : "14px" }}>{s.icon}</div>
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: fullscreen ? "24px" : "18px",
                    fontWeight: 800,
                    fontFamily: "'Fira Mono', monospace",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    color: t.textMuted,
                    fontSize: fullscreen ? "11px" : "9px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!fullscreen && !readOnly && (
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            justifyContent: "center",
          }}
        >
          {blinds.map((b, i) => (
            <button
              key={i}
              onClick={() => goToLevel(i)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: i === currentLevel ? "2px solid #dc2626" : `1px solid ${t.border}`,
                background:
                  i < currentLevel
                    ? "rgba(220,38,38,0.15)"
                    : i === currentLevel
                      ? "rgba(220,38,38,0.3)"
                      : t.rowBg,
                color: i === currentLevel ? "#dc2626" : t.textMuted,
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "'Fira Mono', monospace",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {b.isBreak ? "☕" : b.level}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes criticalPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.05); } }
      `}</style>
    </div>
  );
}
