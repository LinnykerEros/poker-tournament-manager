import { useState } from "react";
import PlayerCard from "../shared/PlayerCard.jsx";
import { formatChips } from "../../utils/formatters.js";

export default function PlayersTab({ players, setPlayers, config }) {
  const [name, setName] = useState("");

  const addPlayer = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: trimmed,
        stack: config.startingStack,
        addOns: 0,
        rebuys: 0,
        eliminated: false,
        place: null,
        eliminatedAt: null,
      },
    ]);
    setName("");
  };

  const removePlayer = (id) => setPlayers((prev) => prev.filter((p) => p.id !== id));

  const toggleEliminated = (id) =>
    setPlayers((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;
      if (!target.eliminated) {
        const activeCount = prev.filter((p) => !p.eliminated && p.id !== id).length;
        return prev.map((p) =>
          p.id === id ? { ...p, eliminated: true, place: activeCount + 1, eliminatedAt: Date.now() } : p
        );
      }
      return prev.map((p) =>
        p.id === id ? { ...p, eliminated: false, place: null, eliminatedAt: null } : p
      );
    });

  const addOn = (id) =>
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, addOns: p.addOns + 1, stack: p.stack + config.addOnChips } : p
      )
    );

  const rebuy = (id) =>
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rebuys: p.rebuys + 1, stack: p.stack + config.rebuyChips } : p
      )
    );

  const activePlayers = players.filter((p) => !p.eliminated);
  const eliminatedPlayers = players.filter((p) => p.eliminated).sort((a, b) => a.place - b.place);

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPlayer()}
          placeholder="Nome do jogador..."
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "10px",
            color: "#e8e8f0",
            fontSize: "14px",
            fontFamily: "'Fira Mono', monospace",
            outline: "none",
          }}
        />
        <button
          onClick={addPlayer}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #d4af37, #f5d76e)",
            color: "#1a1a2e",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 800,
            fontFamily: "'Fira Mono', monospace",
            fontSize: "13px",
            letterSpacing: "0.5px",
          }}
        >
          + ADICIONAR
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Jogadores", value: players.length, icon: "👥" },
          { label: "Ativos", value: activePlayers.length, icon: "🎯" },
          { label: "Eliminados", value: eliminatedPlayers.length, icon: "💀" },
          { label: "Total Chips", value: formatChips(players.reduce((s, p) => s + p.stack, 0)), icon: "🪙" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: "1 1 120px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "12px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
            <div
              style={{
                color: "#d4af37",
                fontSize: "20px",
                fontWeight: 800,
                fontFamily: "'Fira Mono', monospace",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                color: "#6a6a82",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#4a4a62" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🃏</div>
          <div style={{ fontFamily: "'Fira Mono', monospace", fontSize: "14px" }}>
            Nenhum jogador adicionado
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {activePlayers.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            onRemove={removePlayer}
            onEliminate={toggleEliminated}
            onAddOn={addOn}
            onRebuy={rebuy}
          />
        ))}
        {eliminatedPlayers.length > 0 && (
          <>
            <div
              style={{
                color: "#6a6a82",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                margin: "16px 0 8px",
                fontFamily: "'Fira Mono', monospace",
              }}
            >
              💀 Eliminados
            </div>
            {eliminatedPlayers.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                onRemove={removePlayer}
                onEliminate={toggleEliminated}
                onAddOn={addOn}
                onRebuy={rebuy}
                eliminated
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
