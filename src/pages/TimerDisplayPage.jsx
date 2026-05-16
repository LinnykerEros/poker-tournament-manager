import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../theme.jsx";
import { useBroadcastReceiver } from "../hooks/useBroadcastChannel.js";
import { supabase } from "../lib/supabase.js";
import { calculateDriftedSeconds } from "../utils/tournamentHelpers.js";
import { formatTime, formatChips } from "../utils/formatters.js";
import CardSuitBg from "../components/shared/CardSuitBg.jsx";

export default function TimerDisplayPage() {
  const { id } = useParams();
  const { t } = useTheme();

  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    loadInitial();
  }, [id]);

  async function loadInitial() {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;

      const correctedSeconds = calculateDriftedSeconds(
        data.seconds_left,
        data.timer_running,
        data.timer_updated_at
      );

      setState({
        name: data.name,
        blinds: data.blinds,
        currentLevel: data.current_level,
        secondsLeft: correctedSeconds,
        running: data.timer_running,
        config: data.config,
        playerCount: 0,
        avgStack: 0,
        totalChips: 0,
      });
    } catch (e) {
      console.error("Erro ao carregar torneio:", e.message);
    } finally {
      setLoading(false);
    }
  }

  const onMessage = useCallback((data) => {
    setConnected(true);
    setState((prev) => (prev ? { ...prev, ...data } : data));
  }, []);

  useBroadcastReceiver(id, onMessage);

  // Fallback: se não receber broadcast por 5s, decrementa localmente
  useEffect(() => {
    if (!state?.running || connected) return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev || !prev.running || prev.secondsLeft <= 0) return prev;
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state?.running, connected]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.textMuted,
          fontFamily: "'Fira Mono', monospace",
        }}
      >
        Carregando timer...
      </div>
    );
  }

  if (!state) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef4444",
          fontFamily: "'Fira Mono', monospace",
        }}
      >
        Torneio não encontrado
      </div>
    );
  }

  const current = state.blinds?.[state.currentLevel];
  const next = state.blinds?.[state.currentLevel + 1];
  const progress = current ? 1 - state.secondsLeft / (current.duration * 60) : 0;
  const isLow = state.secondsLeft <= 60;
  const isCritical = state.secondsLeft <= 10;

  const cSize = 360;
  const strokeW = 12;
  const cR = cSize / 2 - strokeW - 4;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.pageBg,
        color: t.text,
        fontFamily: "'Fira Mono', 'Courier New', monospace",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <CardSuitBg />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: "1000px", padding: "20px" }}>
        {/* Header */}
        <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <img src="/logo.png" alt="2Z Poker" style={{ width: "48px", height: "auto", filter: t.logoFilter }} />
          <span
            style={{
              fontSize: "24px",
              fontWeight: 900,
              background: "linear-gradient(135deg, #dc2626, #ef4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "2px",
            }}
          >
            {state.name}
          </span>
        </div>

        {current && (
          <>
            {/* Level */}
            <div style={{ color: t.textMuted, fontSize: "18px", textTransform: "uppercase", letterSpacing: "4px", marginBottom: "8px" }}>
              {current.isBreak ? "☕ Intervalo" : `Nível ${current.level}`}
            </div>

            {/* Blinds */}
            {!current.isBreak && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "clamp(42px, 10vw, 72px)", fontWeight: 900, color: "#dc2626", lineHeight: 1 }}>
                  {formatChips(current.small)} / {formatChips(current.big)}
                </div>
                {current.ante > 0 && (
                  <div style={{ color: "#a78bfa", fontSize: "28px", fontWeight: 600, marginTop: "6px" }}>
                    Ante: {formatChips(current.ante)}
                  </div>
                )}
              </div>
            )}

            {/* Timer Circle */}
            <div style={{ position: "relative", width: `${cSize}px`, height: `${cSize}px`, margin: "0 auto 32px" }}>
              <svg width={cSize} height={cSize} viewBox={`0 0 ${cSize} ${cSize}`}>
                <circle cx={cSize / 2} cy={cSize / 2} r={cR} fill="none" stroke={t.circleTrack} strokeWidth={strokeW} />
                <circle
                  cx={cSize / 2}
                  cy={cSize / 2}
                  r={cR}
                  fill="none"
                  stroke={isCritical ? "#dc2626" : isLow ? "#ef4444" : current.isBreak ? "#60a5fa" : "#dc2626"}
                  strokeWidth={strokeW}
                  strokeDasharray={`${2 * Math.PI * cR}`}
                  strokeDashoffset={`${2 * Math.PI * cR * (1 - progress)}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cSize / 2} ${cSize / 2})`}
                  style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span
                  style={{
                    fontSize: "clamp(56px, 16vw, 96px)",
                    fontWeight: 900,
                    color: isCritical ? "#dc2626" : isLow ? "#ef4444" : t.text,
                    animation: isCritical ? "criticalPulse 0.5s infinite" : isLow ? "pulse 1s infinite" : "none",
                  }}
                >
                  {formatTime(state.secondsLeft)}
                </span>
              </div>
            </div>

            {/* Next Level */}
            {next && (
              <div
                style={{
                  background: t.rowBg,
                  borderRadius: "12px",
                  padding: "16px 24px",
                  marginBottom: "28px",
                  border: `1px solid ${t.borderSubtle}`,
                  display: "inline-block",
                }}
              >
                <span style={{ color: t.textMuted, fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px" }}>
                  Próximo →{" "}
                </span>
                <span style={{ color: t.text, fontWeight: 700, fontSize: "20px" }}>
                  {next.isBreak
                    ? "☕ Intervalo"
                    : `${formatChips(next.small)}/${formatChips(next.big)}${next.ante ? ` (ante ${formatChips(next.ante)})` : ""}`}
                </span>
              </div>
            )}

            {/* Stats */}
            <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}>
              {[
                { label: "Jogadores", value: state.playerCount, icon: "👥" },
                { label: "Stack Médio", value: formatChips(state.avgStack), icon: "📊" },
                { label: "Total Chips", value: formatChips(state.totalChips), icon: "🪙" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px" }}>{s.icon}</div>
                  <div style={{ color: "#dc2626", fontSize: "28px", fontWeight: 800 }}>{s.value}</div>
                  <div style={{ color: t.textMuted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Connection indicator */}
        <div style={{ position: "fixed", top: "12px", right: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: connected ? "#22c55e" : "#f59e0b",
              boxShadow: connected ? "0 0 6px #22c55e" : "0 0 6px #f59e0b",
            }}
          />
          <span style={{ color: t.textMuted, fontSize: "10px" }}>
            {connected ? "Sincronizado" : "Aguardando..."}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes criticalPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.05); } }
      `}</style>
    </div>
  );
}
