import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../theme.jsx";
import { useBroadcastReceiver } from "../hooks/useBroadcastChannel.js";
import { supabase } from "../lib/supabase.js";
import {
  calculateDriftedSeconds,
  calculatePrizePool,
  mapDbPlayerToLocal,
} from "../utils/tournamentHelpers.js";
import { formatTime, formatChips, formatMoney } from "../utils/formatters.js";
import CardSuitBg from "../components/shared/CardSuitBg.jsx";

// Premiação mínima garantida. O painel mostra este valor enquanto a
// arrecadação real (buy-ins + add-ons + rebuys + startchips) estiver abaixo
// dele; assim que a real ultrapassar, passa a mostrar a real.
const PREMIACAO_GARANTIDA = 4000;

// Quanto tempo o painel fica na tela após a virada de nível.
const PAINEL_VISIVEL_MS = 4 * 60 * 1000;

// Deixe true para manter o painel fixo na tela (útil para avaliar o visual).
// Em false, ele aparece na virada de nível e some após PAINEL_VISIVEL_MS.
const PAINEL_SEMPRE_VISIVEL = false;

const MEDALHAS = ["🥇", "🥈", "🥉"];

export default function TimerDisplayPage() {
  const { id } = useParams();
  const { t } = useTheme();

  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [showPrizes, setShowPrizes] = useState(PAINEL_SEMPRE_VISIVEL);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const prevLevelRef = useRef(null);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, []);

  // O F11 é do navegador, não da aplicação: nada de interceptar a tecla.
  // Aqui só acompanhamos o estado para o rótulo do botão de tela cheia.
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    loadInitial();
  }, [id]);

  async function loadInitial() {
    try {
      const [tRes, pRes] = await Promise.all([
        supabase.from("tournaments").select("*").eq("id", id).single(),
        supabase.from("tournament_players").select("*").eq("tournament_id", id),
      ]);
      if (tRes.error) throw tRes.error;

      const data = tRes.data;
      const correctedSeconds = calculateDriftedSeconds(
        data.seconds_left,
        data.timer_running,
        data.timer_updated_at
      );

      // Calcula o pool aqui também, para a TV mostrar o valor certo mesmo
      // sem a aba do organizador aberta mandando broadcast.
      const localPlayers = (pRes.data || []).map(mapDbPlayerToLocal);
      const active = localPlayers.filter((p) => !p.eliminated);
      const totalChips = localPlayers.reduce((s, p) => s + (p.stack || 0), 0);

      setState({
        name: data.name,
        blinds: data.blinds,
        prizeStructure: data.prize_structure,
        prizePool: calculatePrizePool(localPlayers, data.config),
        currentLevel: data.current_level,
        secondsLeft: correctedSeconds,
        running: data.timer_running,
        config: data.config,
        playerCount: active.length,
        avgStack: active.length ? Math.round(totalChips / active.length) : 0,
        totalChips,
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

  // Mostra a premiação a cada virada de nível e esconde após 4 min.
  // Só dispara em mudança real de nível — não aparece ao abrir a tela.
  useEffect(() => {
    if (PAINEL_SEMPRE_VISIVEL) return;
    const level = state?.currentLevel;
    if (level == null) return;
    if (prevLevelRef.current === null) {
      prevLevelRef.current = level;
      return;
    }
    if (prevLevelRef.current === level) return;
    prevLevelRef.current = level;
    setShowPrizes(true);
    const timeout = setTimeout(() => setShowPrizes(false), PAINEL_VISIVEL_MS);
    return () => clearTimeout(timeout);
  }, [state?.currentLevel]);

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

  // Enquanto a arrecadação real não passar o garantido, vale o garantido.
  const premiacaoReal = state.prizePool || 0;
  const premiacaoExibida = Math.max(PREMIACAO_GARANTIDA, premiacaoReal);
  const noGarantido = premiacaoReal <= PREMIACAO_GARANTIDA;

  const current = state.blinds?.[state.currentLevel];
  const next = state.blinds?.[state.currentLevel + 1];
  const progress = current ? 1 - state.secondsLeft / (current.duration * 60) : 0;
  const isLow = state.secondsLeft <= 60;
  const isCritical = state.secondsLeft <= 10;

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

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: "min(1800px, 94vw)", padding: "clamp(20px, 3vh, 48px)" }}>
        {/* Header */}
        <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <img src="/logo.png" alt="2Z Poker" style={{ width: "clamp(48px, 5vw, 84px)", height: "auto", filter: t.logoFilter }} />
          <span
            style={{
              fontSize: "clamp(24px, 3vw, 48px)",
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
            <div style={{ color: t.textMuted, fontSize: "clamp(18px, 2.2vw, 34px)", textTransform: "uppercase", letterSpacing: "4px", marginBottom: "clamp(12px, 2vh, 24px)" }}>
              {current.isBreak ? "☕ Intervalo" : `Nível ${current.level}`}
            </div>

            {/* Barra de progresso horizontal */}
            <div
              style={{
                width: "100%",
                height: "clamp(12px, 1.6vh, 22px)",
                background: t.circleTrack,
                borderRadius: "11px",
                overflow: "hidden",
                marginBottom: "clamp(36px, 6vh, 72px)",
              }}
            >
              <div
                style={{
                  width: `${progress * 100}%`,
                  height: "100%",
                  background: isCritical ? "#dc2626" : isLow ? "#ef4444" : current.isBreak ? "#60a5fa" : "#dc2626",
                  borderRadius: "6px",
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
                gap: "clamp(12px, 2vw, 24px)",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(48px, 11vw, 200px)",
                  fontWeight: 900,
                  fontFamily: "'Fira Mono', monospace",
                  color: isCritical ? "#dc2626" : isLow ? "#ef4444" : t.text,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  animation: isCritical ? "criticalPulse 0.5s infinite" : isLow ? "pulse 1s infinite" : "none",
                }}
              >
                {formatTime(state.secondsLeft)}
              </span>

              {!current.isBreak && (
                <>
                <span
                  style={{
                    color: t.textMuted,
                    fontSize: "clamp(36px, 8vw, 150px)",
                    fontWeight: 300,
                    fontFamily: "'Fira Mono', monospace",
                    opacity: 0.3,
                    userSelect: "none",
                  }}
                >
                  |
                </span>
                <span
                  style={{
                    fontSize: "clamp(48px, 11vw, 200px)",
                    whiteSpace: "nowrap",
                    fontWeight: 900,
                    fontFamily: "'Fira Mono', monospace",
                    color: "#dc2626",
                    lineHeight: 1,
                  }}
                >
                  {formatChips(current.small)}/{formatChips(current.big)}
                </span>
                </>
              )}
            </div>

            {/* Ante atual + Próximo nível centralizados */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              {!current.isBreak && current.ante > 0 && (
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ color: t.textMuted, fontSize: "clamp(14px, 1.5vw, 24px)", textTransform: "uppercase", letterSpacing: "2px", fontFamily: "'Fira Mono', monospace" }}>
                    Atual →{" "}
                  </span>
                  <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "clamp(20px, 2.2vw, 38px)", fontFamily: "'Fira Mono', monospace" }}>
                    Ante: {formatChips(current.ante)}
                  </span>
                </div>
              )}
              {next && (
                <div>
                  <span style={{ color: t.textMuted, fontSize: "clamp(14px, 1.5vw, 24px)", textTransform: "uppercase", letterSpacing: "2px", fontFamily: "'Fira Mono', monospace" }}>
                    Próximo →{" "}
                  </span>
                  <span style={{ color: t.text, fontWeight: 700, fontSize: "clamp(20px, 2.2vw, 38px)", fontFamily: "'Fira Mono', monospace" }}>
                    {next.isBreak
                      ? "☕ Intervalo"
                      : `${formatChips(next.small)}/${formatChips(next.big)}${next.ante ? ` (Ante: ${formatChips(next.ante)})` : ""}`}
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(48px, 8vw, 140px)", flexWrap: "wrap" }}>
              {[
                { label: "Jogadores", value: state.playerCount, icon: "👥" },
                { label: "Stack Médio", value: formatChips(state.avgStack), icon: "📊" },
                { label: "Total Chips", value: formatChips(state.totalChips), icon: "🪙" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(24px, 2.5vw, 42px)" }}>{s.icon}</div>
                  <div style={{ color: "#dc2626", fontSize: "clamp(28px, 3.2vw, 60px)", fontWeight: 800 }}>{s.value}</div>
                  <div style={{ color: t.textMuted, fontSize: "clamp(12px, 1.2vw, 20px)", textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Premiação — aparece na virada de nível e some após 4 min */}
        {state.prizeStructure?.length > 0 && (
          <div
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              width: "clamp(290px, 28vw, 400px)",
              background: "rgba(18,18,22,0.94)",
              border: "1px solid rgba(220,38,38,0.35)",
              borderRadius: "16px",
              padding: "18px 22px 16px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              textAlign: "left",
              opacity: showPrizes ? 1 : 0,
              transform: showPrizes ? "translateY(0)" : "translateY(-12px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <div
              style={{
                color: "#fbbf24",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "12px",
              }}
            >
              🏆 Premiação
            </div>

            <div
              style={{
                textAlign: "center",
                paddingBottom: "12px",
                marginBottom: "12px",
                borderBottom: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              <div style={{ color: t.textMuted, fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Valor Total
              </div>
              <div style={{ color: "#dc2626", fontSize: "34px", fontWeight: 900, lineHeight: 1.2 }}>
                {formatMoney(premiacaoExibida)}
              </div>
              {noGarantido && (
                <div style={{ color: t.textMuted, fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Garantido
                </div>
              )}
            </div>

            {state.prizeStructure.slice(0, 5).map((p, i) => (
              <div
                key={p.place ?? i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  padding: "7px 0",
                }}
              >
                <span style={{ fontSize: "18px", width: "32px", flexShrink: 0 }}>
                  {MEDALHAS[i] || `${i + 1}º`}
                </span>
                <span style={{ color: t.textMuted, fontSize: "13px", flexShrink: 0 }}>
                  {p.percent}%
                </span>
                <span
                  style={{
                    color: "#22c55e",
                    fontSize: "19px",
                    fontWeight: 800,
                    marginLeft: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatMoney((premiacaoExibida * p.percent) / 100)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Connection indicator */}
        <div style={{ position: "fixed", top: "12px", left: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
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

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            style={{
              marginLeft: "8px",
              padding: "2px 8px",
              background: "transparent",
              color: t.textMuted,
              border: `1px solid ${t.borderMedium}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: "'Fira Mono', monospace",
              opacity: 0.5,
            }}
          >
            {isFullscreen ? "⛶ Sair" : "⛶ Tela cheia"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes criticalPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.05); } }
      `}</style>
    </div>
  );
}
