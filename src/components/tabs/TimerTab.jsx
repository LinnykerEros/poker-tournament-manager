import { useState, useEffect, useRef, useCallback } from "react";
import { formatTime, formatChips } from "../../utils/formatters.js";
import { useWindowWidth } from "../../utils/hooks.js";
import { ctrlBtn } from "../../styles/shared.js";

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
}) {
  const [flashColor, setFlashColor] = useState(null);
  const intervalRef = useRef(null);
  const audioCtx = useRef(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);

  const playBeep = useCallback(
    (freq = 880, dur = 0.15, vol = 0.3) => {
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "square";
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      } catch (e) {}
    },
    [getAudioCtx]
  );

  const playLevelChangeAlert = useCallback(() => {
    const notes = [660, 880, 1100];
    notes.forEach((freq, i) => setTimeout(() => playBeep(freq, 0.25, 0.6), i * 300));
    setTimeout(
      () => notes.forEach((freq, i) => setTimeout(() => playBeep(freq, 0.25, 0.6), i * 300)),
      1200
    );
    setFlashColor("rgba(212,175,55,0.4)");
    setTimeout(() => setFlashColor(null), 600);
    setTimeout(() => setFlashColor("rgba(212,175,55,0.3)"), 800);
    setTimeout(() => setFlashColor(null), 1400);
    setTimeout(() => setFlashColor("rgba(212,175,55,0.2)"), 1600);
    setTimeout(() => setFlashColor(null), 2200);
  }, [playBeep]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setCurrentLevel((cl) => {
              const next = cl + 1;
              if (next < blinds.length) {
                playLevelChangeAlert();
                setSecondsLeft(blinds[next].duration * 60);
                return next;
              }
              setRunning(false);
              return cl;
            });
            return 0;
          }
          if (prev === 60) playBeep(660, 0.15, 0.4);
          if (prev === 30) playBeep(660, 0.15, 0.4);
          if (prev <= 10) playBeep(880, 0.12, 0.5);
          if (prev <= 5) playBeep(1000, 0.15, 0.6);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, blinds, playBeep, playLevelChangeAlert, setSecondsLeft, setCurrentLevel, setRunning]);

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
              color: "#6a6a82",
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
                  color: "#d4af37",
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
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={fullscreen ? 10 : 6}
              />
              <circle
                cx={cSize / 2}
                cy={cSize / 2}
                r={cR}
                fill="none"
                stroke={
                  isCritical ? "#dc2626" : isLow ? "#ef4444" : current.isBreak ? "#60a5fa" : "#d4af37"
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
                  color: isCritical ? "#dc2626" : isLow ? "#ef4444" : "#e8e8f0",
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
              onClick={() => setRunning(!running)}
              style={{
                ...ctrlBtn,
                width: fullscreen ? "80px" : "64px",
                height: fullscreen ? "80px" : "64px",
                fontSize: fullscreen ? "30px" : "24px",
                background: running ? "rgba(239,68,68,0.2)" : "linear-gradient(135deg, #d4af37, #f5d76e)",
                color: running ? "#ef4444" : "#1a1a2e",
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
                background: fullscreen ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)",
                color: fullscreen ? "#ef4444" : "#a0a0b8",
                border: `1px solid ${fullscreen ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
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
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "20px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span
                style={{
                  color: "#6a6a82",
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
                  color: "#e8e8f0",
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
                    color: "#d4af37",
                    fontSize: fullscreen ? "24px" : "18px",
                    fontWeight: 800,
                    fontFamily: "'Fira Mono', monospace",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    color: "#6a6a82",
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
                border: i === currentLevel ? "2px solid #d4af37" : "1px solid rgba(255,255,255,0.06)",
                background:
                  i < currentLevel
                    ? "rgba(212,175,55,0.15)"
                    : i === currentLevel
                      ? "rgba(212,175,55,0.3)"
                      : "rgba(255,255,255,0.03)",
                color: i === currentLevel ? "#d4af37" : "#6a6a82",
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
