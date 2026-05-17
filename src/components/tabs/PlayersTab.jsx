import { useState, useEffect } from "react";
import { useTheme } from "../../theme.jsx";
import { useTournamentContext } from "../../contexts/TournamentContext.jsx";
import { useTournament } from "../../hooks/useTournament.js";
import PlayerCard from "../shared/PlayerCard.jsx";
import { formatChips } from "../../utils/formatters.js";

export default function PlayersTab({ readOnly = false }) {
  const { t } = useTheme();
  const {
    players,
    config,
    addPlayerToTournament,
    removePlayerFromTournament,
    updatePlayerInTournament,
  } = useTournamentContext();
  const { listProfiles } = useTournament();

  const [name, setName] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    listProfiles()
      .then(setProfiles)
      .catch((e) => console.error("Erro ao carregar perfis:", e.message));
  }, []);

  const existingPlayerIds = new Set(players.map((p) => p.playerId));
  const availableProfiles = profiles.filter(
    (p) => !existingPlayerIds.has(p.id) && p.display_name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  async function handleAddFromProfile(profile) {
    try {
      await addPlayerToTournament(profile.id, profile.display_name);
      setShowProfilePicker(false);
      setSearchFilter("");
    } catch (e) {
      console.error("Erro ao adicionar jogador:", e.message);
    }
  }

  async function handleAddByName() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await addPlayerToTournament(null, trimmed);
      setName("");
    } catch (e) {
      console.error("Erro ao adicionar jogador:", e.message);
    }
  }

  const removePlayer = async (id) => {
    try {
      await removePlayerFromTournament(id);
    } catch (e) {
      console.error("Erro ao remover jogador:", e.message);
    }
  };

  const toggleEliminated = async (id) => {
    const target = players.find((p) => p.id === id);
    if (!target) return;
    if (!target.eliminated) {
      const activeCount = players.filter((p) => !p.eliminated && p.id !== id).length;
      await updatePlayerInTournament(id, {
        eliminated: true,
        place: activeCount + 1,
        eliminatedAt: new Date().toISOString(),
      });
    } else {
      await updatePlayerInTournament(id, {
        eliminated: false,
        place: null,
        eliminatedAt: null,
      });
    }
  };

  const addOn = async (id) => {
    const p = players.find((pl) => pl.id === id);
    if (!p) return;
    await updatePlayerInTournament(id, {
      addOns: p.addOns + 1,
      stack: p.stack + config.addOnChips,
    });
  };

  const rebuy = async (id) => {
    const p = players.find((pl) => pl.id === id);
    if (!p) return;
    await updatePlayerInTournament(id, {
      rebuys: p.rebuys + 1,
      stack: p.stack + config.rebuyChips,
    });
  };

  const activePlayers = players.filter((p) => !p.eliminated);
  const eliminatedPlayers = players.filter((p) => p.eliminated).sort((a, b) => a.place - b.place);

  return (
    <div>
      {!readOnly && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddByName()}
              placeholder="Nome do jogador..."
              style={{
                flex: 1,
                padding: "12px 16px",
                background: t.inputBg,
                border: "1px solid rgba(220,38,38,0.3)",
                borderRadius: "10px",
                color: t.text,
                fontSize: "13px",
                fontFamily: "'Fira Mono', monospace",
                outline: "none",
              }}
            />
            <button
              onClick={handleAddByName}
              disabled={!name.trim()}
              style={{
                padding: "12px 20px",
                background: name.trim()
                  ? "linear-gradient(135deg, #dc2626, #ef4444)"
                  : "rgba(107,114,128,0.3)",
                color: name.trim() ? "#ffffff" : "#6b7280",
                border: "none",
                borderRadius: "10px",
                cursor: name.trim() ? "pointer" : "not-allowed",
                fontWeight: 800,
                fontFamily: "'Fira Mono', monospace",
                fontSize: "13px",
              }}
            >
              + ADICIONAR
            </button>
          </div>
          <button
            onClick={() => setShowProfilePicker(!showProfilePicker)}
            style={{
              padding: "8px 16px",
              background: t.activeBg,
              color: t.textMuted,
              border: `1px solid ${t.borderMedium || t.border}`,
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
            👤 SELECIONAR MEMBRO CADASTRADO
          </button>
        </div>
      )}

      {!readOnly && showProfilePicker && (
        <div
          style={{
            background: t.containerBg,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            backdropFilter: "blur(12px)",
          }}
        >
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar membro..."
            autoFocus
            style={{
              width: "100%",
              padding: "10px 14px",
              background: t.inputBg,
              border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: "8px",
              color: t.text,
              fontSize: "13px",
              fontFamily: "'Fira Mono', monospace",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "12px",
            }}
          />
          {availableProfiles.length === 0 ? (
            <div style={{ color: t.textMuted, fontSize: "12px", textAlign: "center", padding: "12px" }}>
              {profiles.length === 0
                ? "Nenhum membro cadastrado ainda"
                : "Todos os membros já foram adicionados"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
              {availableProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleAddFromProfile(profile)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    background: t.rowBg,
                    border: `1px solid ${t.borderSubtle}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: t.text,
                    fontFamily: "'Fira Mono', monospace",
                    fontSize: "13px",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #dc2626, #ef4444)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "12px",
                      }}
                    >
                      {profile.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontWeight: 600 }}>{profile.display_name}</span>
                  <span style={{ color: t.textMuted, fontSize: "11px", marginLeft: "auto" }}>
                    {profile.email}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
              background: t.statBg,
              border: `1px solid ${t.border}`,
              borderRadius: "10px",
              padding: "12px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
            <div
              style={{
                color: "#dc2626",
                fontSize: "20px",
                fontWeight: 800,
                fontFamily: "'Fira Mono', monospace",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                color: t.textMuted,
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
        <div style={{ textAlign: "center", padding: "48px 0", color: t.textEmpty }}>
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
            readOnly={readOnly}
          />
        ))}
        {eliminatedPlayers.length > 0 && (
          <>
            <div
              style={{
                color: t.textMuted,
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
                readOnly={readOnly}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
