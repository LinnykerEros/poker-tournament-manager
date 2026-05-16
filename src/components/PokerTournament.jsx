import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../theme.jsx";
import CardSuitBg from "./shared/CardSuitBg.jsx";
import TabBtn from "./shared/TabBtn.jsx";
import TimerTab from "./tabs/TimerTab.jsx";
import PlayersTab from "./tabs/PlayersTab.jsx";
import RankingTab from "./tabs/RankingTab.jsx";
import BlindsTab from "./tabs/BlindsTab.jsx";
import ConfigTab from "./tabs/ConfigTab.jsx";
import { DEFAULT_BLINDS, DEFAULT_PRIZE_STRUCTURE } from "../utils/constants.js";

export default function PokerTournament() {
  const { t, mode, toggle } = useTheme();
  const [tab, setTab] = useState("timer");
  const [players, setPlayers] = useState([]);
  const [blinds, setBlinds] = useState(DEFAULT_BLINDS);
  const [fullscreen, setFullscreen] = useState(false);
  const [config, setConfig] = useState({
    startingStack: 10000,
    addOnChips: 5000,
    rebuyChips: 10000,
    addOnCost: 20,
    rebuyCost: 30,
    buyIn: 50,
  });
  const [prizeStructure, setPrizeStructure] = useState(DEFAULT_PRIZE_STRUCTURE);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_BLINDS[0]?.duration * 60 || 0);
  const [running, setRunning] = useState(false);

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
  }, [running, blinds, playBeep, playLevelChangeAlert]);

  const themeToggle = (
    <button
      onClick={toggle}
      style={{
        position: "absolute",
        top: "0",
        right: "0",
        background: "none",
        border: "none",
        color: t.textMuted,
        cursor: "pointer",
        fontSize: "16px",
        padding: "4px 0",
        opacity: 0.5,
        transition: "opacity 0.2s",
      }}
      title={mode === "dark" ? "Modo claro" : "Modo escuro"}
    >
      {mode === "dark" ? "☀️" : "🌙"}
    </button>
  );

  if (fullscreen) {
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
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
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
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.pageBg,
        color: t.text,
        fontFamily: "'Fira Mono', 'Courier New', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <CardSuitBg />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px", position: "relative" }}>
          {themeToggle}
          <img
            src="/logo.png"
            alt="2Z Poker"
            style={{
              width: "clamp(60px, 18vw, 100px)",
              height: "auto",
              marginBottom: "8px",
              filter: t.logoFilter,
            }}
          />
          <h1
            style={{
              fontSize: "clamp(18px, 6vw, 28px)",
              fontWeight: 900,
              margin: 0,
              background: "linear-gradient(135deg, #dc2626, #ef4444, #dc2626)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "clamp(1px, 0.5vw, 2px)",
              whiteSpace: "nowrap",
            }}
          >
            2Z POKER
          </h1>
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
            />
          )}
          {tab === "players" && <PlayersTab players={players} setPlayers={setPlayers} config={config} />}
          {tab === "ranking" && (
            <RankingTab players={players} config={config} prizeStructure={prizeStructure} />
          )}
          {tab === "blinds" && <BlindsTab blinds={blinds} setBlinds={setBlinds} />}
          {tab === "config" && (
            <ConfigTab
              config={config}
              setConfig={setConfig}
              prizeStructure={prizeStructure}
              setPrizeStructure={setPrizeStructure}
              players={players}
            />
          )}
        </div>
      </div>
    </div>
  );
}
