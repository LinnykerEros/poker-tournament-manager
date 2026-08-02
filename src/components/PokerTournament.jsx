import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme.jsx";
import { useTournamentContext } from "../contexts/TournamentContext.jsx";
import { useBroadcastSender } from "../hooks/useBroadcastChannel.js";
import { useTimerSounds } from "../hooks/useTimerSounds.js";
import { nextBlindLevel } from "../utils/blindProgression.js";
import { calculatePrizePool } from "../utils/tournamentHelpers.js";
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
    canEdit,
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
      prizeStructure,
      prizePool: calculatePrizePool(players, config),
      playerCount: activePlayers.length,
      avgStack,
      totalChips,
      name: tournament.name,
    });
  }, [secondsLeft, currentLevel, running, players, blinds, prizeStructure, config, tournament, broadcast]);

  const { getAudioCtx, playBeep, playLevelChangeAlert } = useTimerSounds();

  // Antes do torneio começar, o relógio acompanha a duração configurada na aba
  // Blinds. Depois que começa nunca mais se auto-ajusta: um torneio pausado no
  // meio de um nível perderia o tempo já corrido.
  useEffect(() => {
    if (running || tournament?.started_at || !isOrganizer) return;
    const level = blinds[currentLevel];
    if (!level) return;
    const alvo = level.duration * 60;
    if (secondsLeft === alvo) return;
    updateTournamentField({ seconds_left: alvo });
  }, [running, tournament?.started_at, isOrganizer, blinds, currentLevel, secondsLeft, updateTournamentField]);

  // Gera o próximo nível automaticamente ao passar da metade do último nível,
  // para o torneio não travar se ainda estiver rolando. Só age em torneios com
  // config.autoExtendBlinds ligado.
  //
  // Continua preso a isOrganizer de propósito, e não a canEdit: precisa de um
  // escritor único. Com todo mundo editando, cada aba aberta gravaria seu
  // próprio nível ao cruzar a metade e a estrutura ganharia níveis duplicados.
  useEffect(() => {
    if (!running || !isOrganizer) return;
    if (!config.autoExtendBlinds) return;
    if (currentLevel !== blinds.length - 1) return;
    const current = blinds[currentLevel];
    if (!current || current.isBreak) return;
    if (secondsLeft > (current.duration * 60) / 2) return;
    setBlinds((prev) => [...prev, nextBlindLevel(prev)]);
  }, [running, isOrganizer, config.autoExtendBlinds, currentLevel, secondsLeft, blinds, setBlinds]);

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
            readOnly={!canEdit}
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
        {canEdit && (
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
            readOnly={!canEdit}
          />
        )}
        {tab === "players" && <PlayersTab readOnly={!canEdit} />}
        {tab === "ranking" && (
          <RankingTab players={players} config={config} prizeStructure={prizeStructure} />
        )}
        {tab === "blinds" && <BlindsTab blinds={blinds} setBlinds={setBlinds} readOnly={!canEdit} />}
        {tab === "config" && (
          <ConfigTab
            config={config}
            setConfig={setConfig}
            prizeStructure={prizeStructure}
            setPrizeStructure={setPrizeStructure}
            players={players}
            readOnly={!canEdit}
          />
        )}
      </div>

      {canEdit && (
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
