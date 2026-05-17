import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTournament } from "../hooks/useTournament.js";

const statusLabels = {
  setup: { text: "Configurando", color: "#6b7280" },
  running: { text: "Em andamento", color: "#22c55e" },
  paused: { text: "Pausado", color: "#f59e0b" },
  finished: { text: "Finalizado", color: "#6b7280" },
};

export default function DashboardPage() {
  const { t } = useTheme();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { listTournaments, createTournament, deleteTournament } = useTournament();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const hasActiveTournament = tournaments.some((t) => ["setup", "running", "paused"].includes(t.status));

  useEffect(() => {
    loadList();
  }, []);

  async function loadList() {
    try {
      setLoading(true);
      const data = await listTournaments();
      setTournaments(data);
    } catch (e) {
      console.error("Erro ao carregar torneios:", e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (hasActiveTournament) {
      alert("Finalize o torneio em andamento antes de criar um novo.");
      return;
    }
    try {
      setCreating(true);
      const newTournament = await createTournament(trimmed);
      setNewName("");
      setShowForm(false);
      navigate(`/tournament/${newTournament.id}`);
    } catch (e) {
      console.error("Erro ao criar torneio:", e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm("Excluir este torneio?")) return;
    try {
      await deleteTournament(id);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Erro ao excluir:", err.message);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 900,
            background: "linear-gradient(135deg, #dc2626, #ef4444)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TORNEIOS
        </h2>
        <button
          onClick={() => !hasActiveTournament && setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            background: hasActiveTournament
              ? "rgba(107,114,128,0.3)"
              : "linear-gradient(135deg, #dc2626, #ef4444)",
            color: hasActiveTournament ? "#6b7280" : "#ffffff",
            border: "none",
            borderRadius: "10px",
            cursor: hasActiveTournament ? "not-allowed" : "pointer",
            fontWeight: 800,
            fontFamily: "'Fira Mono', monospace",
            fontSize: "12px",
            letterSpacing: "0.5px",
            opacity: hasActiveTournament ? 0.6 : 1,
          }}
          title={hasActiveTournament ? "Finalize o torneio ativo antes de criar outro" : ""}
        >
          + NOVO TORNEIO
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: t.containerBg,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Nome do torneio..."
              autoFocus
              style={{
                flex: 1,
                padding: "12px 16px",
                background: t.inputBg,
                border: "1px solid rgba(220,38,38,0.3)",
                borderRadius: "10px",
                color: t.text,
                fontSize: "14px",
                fontFamily: "'Fira Mono', monospace",
                outline: "none",
              }}
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #dc2626, #ef4444)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 800,
                fontFamily: "'Fira Mono', monospace",
                fontSize: "13px",
                opacity: creating ? 0.6 : 1,
              }}
            >
              {creating ? "..." : "CRIAR"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: t.textMuted }}>
          Carregando...
        </div>
      ) : tournaments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: t.textEmpty }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🃏</div>
          <div style={{ fontFamily: "'Fira Mono', monospace", fontSize: "15px", marginBottom: "4px" }}>
            Nenhum torneio ainda
          </div>
          <div style={{ fontFamily: "'Fira Mono', monospace", fontSize: "12px", color: t.textMuted }}>
            Clique em "+ NOVO TORNEIO" para começar
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tournaments.map((tour) => {
            const st = statusLabels[tour.status] || statusLabels.setup;
            const playerCount = tour.tournament_players?.[0]?.count || 0;
            return (
              <div
                key={tour.id}
                onClick={() => navigate(`/tournament/${tour.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  background: t.containerBg,
                  border: `1px solid ${t.border}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  transition: "border-color 0.2s",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background:
                      tour.status === "running"
                        ? "linear-gradient(135deg, #dc2626, #ef4444)"
                        : t.activeBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  {tour.status === "finished" ? "🏆" : tour.status === "running" ? "▶" : "🃏"}
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: t.text }}>
                    {tour.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginTop: "4px",
                      fontSize: "11px",
                      color: t.textMuted,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{formatDate(tour.created_at)}</span>
                    <span>👥 {playerCount}</span>
                    <span style={{ color: st.color, fontWeight: 700 }}>{st.text}</span>
                  </div>
                </div>
                {tour.status === "setup" && tour.organizer_id === session?.user?.id && (
                  <button
                    onClick={(e) => handleDelete(tour.id, e)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: "4px 8px",
                      opacity: 0.6,
                    }}
                    title="Excluir torneio"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
