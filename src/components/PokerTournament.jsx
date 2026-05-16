import { useState } from "react";
import CardSuitBg from "./shared/CardSuitBg.jsx";
import TabBtn from "./shared/TabBtn.jsx";
import TimerTab from "./tabs/TimerTab.jsx";
import PlayersTab from "./tabs/PlayersTab.jsx";
import RankingTab from "./tabs/RankingTab.jsx";
import BlindsTab from "./tabs/BlindsTab.jsx";
import ConfigTab from "./tabs/ConfigTab.jsx";
import { DEFAULT_BLINDS, DEFAULT_PRIZE_STRUCTURE } from "../utils/constants.js";

export default function PokerTournament() {
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

  if (fullscreen) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(170deg, #0d0d1a 0%, #1a1a2e 40%, #16213e 100%)",
          color: "#e8e8f0",
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
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(170deg, #0d0d1a 0%, #1a1a2e 40%, #16213e 100%)",
        color: "#e8e8f0",
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
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#d4af37",
              letterSpacing: "6px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            ♠ ♥ ♦ ♣
          </div>
          <h1
            style={{
              fontSize: "clamp(18px, 6vw, 28px)",
              fontWeight: 900,
              margin: 0,
              background: "linear-gradient(135deg, #d4af37, #f5d76e, #d4af37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "clamp(1px, 0.5vw, 2px)",
              whiteSpace: "nowrap",
            }}
          >
            POKER TOURNAMENT
          </h1>
          <div
            style={{
              fontSize: "10px",
              color: "#6a6a82",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginTop: "4px",
            }}
          >
            MANAGER
          </div>
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
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
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
