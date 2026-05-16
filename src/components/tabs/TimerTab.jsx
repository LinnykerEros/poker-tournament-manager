import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../theme.jsx";
import { formatTime, formatChips } from "../../utils/formatters.js";
import { useWindowWidth } from "../../utils/hooks.js";
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

  const windowWidth = useWindowWidth();
  const maxCSize = fullscreen ? 320 : 200;
  const minCSize = 160;
  const cSize = Math.max(minCSize, Math.min(maxCSize, windowWidth - 48));
  const strokeW = fullscreen ? 10 : 6;
  const cR = cSize / 2 - strokeW - 4;

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
          {!current.isBreak && (
            <div style={{ marginBottom: fullscreen ? "24px" : "16px" }}>
              <div
                style={{
                  fontSize: fullscreen ? "clamp(36px, 9vw, 64px)" : "clamp(28px, 8vw, 42px)",
                  fontWeight: 900,
                  fontFamily: "'Fira Mono', monospace",
                  color: "#dc2626",
                  lineHeight: 1,
                  wordBreak: "break-word",
                }}
              >
                {formatChips(current.small)} / {formatChips(current.big)}
              </div>
              {current.ante > 0 && (
                <div
                  style={{
                    color: "#a78bfa",
                    fontSize: fullscreen ? "24px" : "16px",
                    fontWeight: 600,
                    marginTop: "4px",
                    fontFamily: "'Fira Mono', monospace",
                  }}
                >
                  Ante: {formatChips(current.ante)}
                </div>
              )}
            </div>
          )}

          <div
            style={{
              position: "relative",
              width: `${cSize}px`,
              height: `${cSize}px`,
              margin: `0 auto ${fullscreen ? "30px" : "20px"}`,
            }}
          >
            <svg width={cSize} height={cSize} viewBox={`0 0 ${cSize} ${cSize}`}>
              <circle
                cx={cSize / 2}
                cy={cSize / 2}
                r={cR}
                fill="none"
                stroke={t.circleTrack}
                strokeWidth={fullscreen ? 10 : 6}
              />
              <circle
                cx={cSize / 2}
                cy={cSize / 2}
                r={cR}
                fill="none"
                stroke={
                  isCritical ? "#dc2626" : isLow ? "#ef4444" : current.isBreak ? "#60a5fa" : "#dc2626"
                }
                strokeWidth={fullscreen ? 10 : 6}
                strokeDasharray={`${2 * Math.PI * cR}`}
                strokeDashoffset={`${2 * Math.PI * cR * (1 - progress)}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${cSize / 2} ${cSize / 2})`}
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: fullscreen ? "clamp(48px, 14vw, 84px)" : "clamp(34px, 11vw, 48px)",
                  fontWeight: 900,
                  fontFamily: "'Fira Mono', monospace",
                  color: isCritical ? "#dc2626" : isLow ? "#ef4444" : t.text,
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
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
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

          {next && (
            <div
              style={{
                background: t.rowBg,
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "20px",
                border: `1px solid ${t.borderSubtle}`,
              }}
            >
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
                  : `${formatChips(next.small)}/${formatChips(next.big)}${next.ante ? ` (ante ${formatChips(next.ante)})` : ""}`}
              </span>
            </div>
          )}

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

      {!fullscreen && (
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
