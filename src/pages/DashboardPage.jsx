import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme.jsx";
import { useTournament } from "../hooks/useTournament.js";

const statusLabels = {
  setup: { text: "Configurando", color: "#6b7280" },
  running: { text: "Em andamento", color: "#22c55e" },
  paused: { text: "Pausado", color: "#f59e0b" },
  finished: { text: "Finalizado", color: "#6b7280" },
};

export default function DashboardPage() {
  const { t } = useTheme();
  const navigate = useNavigate();
  const { listTournaments, createTournament, deleteTournament } = useTournament();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

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

  async function handleDelete(tour, e) {
    e.stopPropagation();

    // Só finalizado é excluível — e finalizado é justamente o que o ranking
    // mensal lê, então a exclusão sempre tira o torneio de lá.
    if (
      !confirm(
        `Excluir "${tour.name}"?\n\n` +
          `Os jogadores deste torneio serão apagados junto e ele sairá do ranking mensal.\n\n` +
          `Esta ação não pode ser desfeita.`
      )
    )
      return;

    try {
      setDeletingId(tour.id);
      setDeleteError("");
      await deleteTournament(tour.id);
      setTournaments((prev) => prev.filter((item) => item.id !== tour.id));
    } catch (err) {
      console.error("Erro ao excluir:", err.message);
      setDeleteError(`Não foi possível excluir "${tour.name}": ${err.message}`);
    } finally {
      setDeletingId(null);
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
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/ranking")}
            style={{
              padding: "10px 16px",
              background: "transparent",
              color: t.text,
              border: `1px solid ${t.borderStrong}`,
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 800,
              fontFamily: "'Fira Mono', monospace",
              fontSize: "12px",
              letterSpacing: "0.5px",
            }}
            title="Ver ranking mensal"
          >
            🏆 RANKING
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #dc2626, #ef4444)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 800,
              fontFamily: "'Fira Mono', monospace",
              fontSize: "12px",
              letterSpacing: "0.5px",
            }}
          >
            + NOVO TORNEIO
          </button>
        </div>
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

      {deleteError && (
        <div
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "16px",
            color: "#ef4444",
            fontFamily: "'Fira Mono', monospace",
            fontSize: "12px",
          }}
        >
          {deleteError}
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
                {tour.status === "finished" && (
                  <button
                    onClick={(e) => handleDelete(tour, e)}
                    disabled={deletingId === tour.id}
                    style={{
                      background: "transparent",
                      border: `1px solid ${t.border}`,
                      borderRadius: "8px",
                      color: "#ef4444",
                      cursor: deletingId === tour.id ? "default" : "pointer",
                      fontSize: "14px",
                      lineHeight: 1,
                      padding: "8px 10px",
                      flexShrink: 0,
                      opacity: deletingId === tour.id ? 0.4 : 0.75,
                      transition: "opacity 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (deletingId === tour.id) return;
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      if (deletingId === tour.id) return;
                      e.currentTarget.style.opacity = "0.75";
                      e.currentTarget.style.borderColor = t.border;
                    }}
                    title={`Excluir "${tour.name}"`}
                  >
                    {deletingId === tour.id ? "..." : "🗑"}
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
