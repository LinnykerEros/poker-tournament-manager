import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme.jsx";
import { useTournamentContext } from "../contexts/TournamentContext.jsx";
import { useBroadcastSender } from "../hooks/useBroadcastChannel.js";
import CardSuitBg from "./shared/CardSuitBg.jsx";
import TabBtn from "./shared/TabBtn.jsx";
import TimerTab from "./tabs/TimerTab.jsx";
import PlayersTab from "./tabs/PlayersTab.jsx";
import RankingTab from "./tabs/RankingTab.jsx";
import BlindsTab from "./tabs/BlindsTab.jsx";
import ConfigTab from "./tabs/ConfigTab.jsx";

export default function PokerTournament() {
  const { t } = useTheme();
  const navigate = useNavigate();
  const ctx = useTournamentContext();
  const {
    tournament,
    players,
    loading,
    error,
    config,
    blinds,
    prizeStructure,
    currentLevel,
    secondsLeft,
    running,
    isOrganizer,
    setCurrentLevel,
    setSecondsLeft,
    setRunning,
    setBlinds,
    setConfig,
    setPrizeStructure,
    updateTournamentField,
  } = ctx;

  const [tab, setTab] = useState("timer");
  const [fullscreen, setFullscreen] = useState(false);

  const broadcast = useBroadcastSender(tournament?.id);

  const openTimerWindow = () => {
    window.open(`/tournament/${tournament.id}/timer`, "_blank", "noopener");
  };

  const handleFinishTournament = async () => {
    if (!confirm("Encerrar este torneio? Essa ação não pode ser desfeita.")) return;
    await updateTournamentField({
      status: "finished",
      timer_running: false,
      finished_at: new Date().toISOString(),
    });
    navigate("/");
  };

  // Broadcast timer state to other tabs every second
  useEffect(() => {
    if (!tournament?.id) return;
    const activePlayers = players.filter((p) => !p.eliminated);
    const totalChips = players.reduce((s, p) => s + p.stack, 0);
    const avgStack = activePlayers.length > 0 ? Math.round(totalChips / activePlayers.length) : 0;
    broadcast({
      currentLevel,
      secondsLeft,
      running,
      blinds,
      playerCount: activePlayers.length,
      avgStack,
      totalChips,
      name: tournament.name,
    });
  }, [secondsLeft, currentLevel, running, players, blinds, tournament, broadcast]);

  const audioCtx = useRef(null);
  const getAudioCtx = useCallback(() => {
    if (!audioCtx.current)
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
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
  }, [playBeep]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
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
    return () => clearInterval(interval);
  }, [running, blinds, playBeep, playLevelChangeAlert, setSecondsLeft, setCurrentLevel, setRunning]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0", color: t.textMuted }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🃏</div>
        Carregando torneio...
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0", color: "#ef4444" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠</div>
        {error || "Torneio não encontrado"}
      </div>
    );
  }

  if (fullscreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: t.pageBg,
          color: t.text,
          fontFamily: "'Fira Mono', 'Courier New', monospace",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        }}
      >
        <CardSuitBg />
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "900px", padding: "20px" }}>
          <TimerTab
            blinds={blinds}
            players={players}
            fullscreen={fullscreen}
            setFullscreen={setFullscreen}
            currentLevel={currentLevel}
            setCurrentLevel={setCurrentLevel}
            secondsLeft={secondsLeft}
            setSecondsLeft={setSecondsLeft}
            running={running}
            setRunning={setRunning}
            getAudioCtx={getAudioCtx}
            readOnly={!isOrganizer || tournament.status === "finished"}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 900,
            margin: "0 0 10px",
            color: t.text,
          }}
        >
          {tournament.name}
        </h2>
        {!isOrganizer && (
          <div style={{
            display: "inline-block",
            padding: "4px 12px",
            background: "rgba(96,165,250,0.1)",
            border: "1px solid rgba(96,165,250,0.3)",
            borderRadius: "6px",
            color: "#60a5fa",
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: "'Fira Mono', monospace",
            marginBottom: "8px",
          }}>
            MODO ESPECTADOR
          </div>
        )}
        {isOrganizer && (
          <button
            onClick={openTimerWindow}
            style={{
              padding: "6px 16px",
              background: t.activeBg,
              color: t.textMuted,
              border: `1px solid ${t.borderMedium}`,
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              fontFamily: "'Fira Mono', monospace",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📺 ABRIR TIMER NA TV
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <TabBtn active={tab === "timer"} label="Timer" icon="⏱" onClick={() => setTab("timer")} />
        <TabBtn active={tab === "players"} label="Jogadores" icon="👥" onClick={() => setTab("players")} />
        <TabBtn active={tab === "ranking"} label="Ranking" icon="🏆" onClick={() => setTab("ranking")} />
        <TabBtn active={tab === "blinds"} label="Blinds" icon="🎰" onClick={() => setTab("blinds")} />
        <TabBtn active={tab === "config"} label="Config" icon="⚙" onClick={() => setTab("config")} />
      </div>

      <div
        style={{
          background: t.containerBg,
          border: `1px solid ${t.border}`,
          borderRadius: "16px",
          padding: "24px",
          backdropFilter: "blur(12px)",
        }}
      >
        {tab === "timer" && (
          <TimerTab
            blinds={blinds}
            players={players}
            fullscreen={fullscreen}
            setFullscreen={setFullscreen}
            currentLevel={currentLevel}
            setCurrentLevel={setCurrentLevel}
            secondsLeft={secondsLeft}
            setSecondsLeft={setSecondsLeft}
            running={running}
            setRunning={setRunning}
            getAudioCtx={getAudioCtx}
            readOnly={!isOrganizer || tournament.status === "finished"}
          />
        )}
        {tab === "players" && <PlayersTab readOnly={!isOrganizer} />}
        {tab === "ranking" && (
          <RankingTab players={players} config={config} prizeStructure={prizeStructure} />
        )}
        {tab === "blinds" && <BlindsTab blinds={blinds} setBlinds={setBlinds} readOnly={!isOrganizer} />}
        {tab === "config" && (
          <ConfigTab
            config={config}
            setConfig={setConfig}
            prizeStructure={prizeStructure}
            setPrizeStructure={setPrizeStructure}
            players={players}
            readOnly={!isOrganizer || tournament.status === "finished"}
          />
        )}
      </div>

      {isOrganizer && tournament.status !== "finished" && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={handleFinishTournament}
            style={{
              padding: "10px 24px",
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 700,
              fontFamily: "'Fira Mono', monospace",
              fontSize: "12px",
              letterSpacing: "0.5px",
            }}
          >
            ENCERRAR TORNEIO
          </button>
        </div>
      )}
    </div>
  );
}
