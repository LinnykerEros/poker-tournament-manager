import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../theme.jsx";
import { useTournament } from "../hooks/useTournament.js";
import {
  aggregateRanking,
  formatMonthLabel,
  monthRange,
  WSOP_POINTS,
} from "../utils/rankingHelpers.js";

const PLACE_MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function RankingPage() {
  const { t } = useTheme();
  const { listFinishedTournamentsInRange } = useTournament();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { start, end } = monthRange(year, month);
        const data = await listFinishedTournamentsInRange(start, end);
        if (!cancelled) setTournaments(data || []);
      } catch (e) {
        console.error("Erro ao carregar ranking:", e.message);
        if (!cancelled) setTournaments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const ranking = useMemo(() => aggregateRanking(tournaments), [tournaments]);

  function shiftMonth(delta) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  const navBtn = {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: t.inputBg,
    border: `1px solid ${t.border}`,
    color: t.text,
    cursor: "pointer",
    fontSize: "16px",
    fontFamily: "'Fira Mono', monospace",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const headerCell = {
    padding: "10px 8px",
    textAlign: "center",
    fontFamily: "'Fira Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    color: t.textMuted,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderBottom: `1px solid ${t.border}`,
    whiteSpace: "nowrap",
  };

  const bodyCell = {
    padding: "12px 8px",
    textAlign: "center",
    fontFamily: "'Fira Mono', monospace",
    fontSize: "13px",
    color: t.text,
    borderBottom: `1px solid ${t.borderLight}`,
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
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
          RANKING MENSAL
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => shiftMonth(-1)} style={navBtn} title="Mês anterior">
            ‹
          </button>
          <div
            style={{
              minWidth: "160px",
              textAlign: "center",
              fontFamily: "'Fira Mono', monospace",
              fontSize: "13px",
              fontWeight: 700,
              color: t.text,
            }}
          >
            {formatMonthLabel(year, month)}
          </div>
          <button
            onClick={() => !isCurrentMonth && shiftMonth(1)}
            disabled={isCurrentMonth}
            style={{
              ...navBtn,
              opacity: isCurrentMonth ? 0.3 : 1,
              cursor: isCurrentMonth ? "not-allowed" : "pointer",
            }}
            title={isCurrentMonth ? "Mês atual" : "Próximo mês"}
          >
            ›
          </button>
        </div>
      </div>

      <div
        style={{
          background: t.containerBg,
          border: `1px solid ${t.border}`,
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "16px",
          backdropFilter: "blur(12px)",
          display: "flex",
          gap: "20px",
          fontFamily: "'Fira Mono', monospace",
          fontSize: "12px",
          color: t.textMuted,
          flexWrap: "wrap",
        }}
      >
        <span>
          Torneios: <strong style={{ color: t.text }}>{tournaments.length}</strong>
        </span>
        <span>
          Jogadores ranqueados:{" "}
          <strong style={{ color: t.text }}>{ranking.length}</strong>
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: t.textMuted }}>
          Carregando...
        </div>
      ) : ranking.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: t.textEmpty }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>📊</div>
          <div
            style={{
              fontFamily: "'Fira Mono', monospace",
              fontSize: "15px",
              marginBottom: "4px",
            }}
          >
            Nenhum jogador ranqueado
          </div>
          <div
            style={{
              fontFamily: "'Fira Mono', monospace",
              fontSize: "12px",
              color: t.textMuted,
            }}
          >
            Finalize torneios neste mês para gerar o ranking
          </div>
        </div>
      ) : (
        <div
          style={{
            background: t.containerBg,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            overflow: "auto",
            backdropFilter: "blur(12px)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
            <thead>
              <tr>
                <th style={{ ...headerCell, textAlign: "left", paddingLeft: "16px" }}>#</th>
                <th style={{ ...headerCell, textAlign: "left" }}>Jogador</th>
                <th style={headerCell}>Vitórias</th>
                <th style={headerCell}>2º/3º</th>
                <th style={headerCell}>Final Tables</th>
                <th style={headerCell}>Torneios</th>
                <th style={{ ...headerCell, paddingRight: "16px" }}>Pontos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((p) => {
                const medal = PLACE_MEDAL[p.position];
                return (
                  <tr key={p.key}>
                    <td
                      style={{
                        ...bodyCell,
                        textAlign: "left",
                        paddingLeft: "16px",
                        fontWeight: 700,
                        color: medal ? t.text : t.textMuted,
                      }}
                    >
                      {medal ? `${medal} ${p.position}` : p.position}
                    </td>
                    <td
                      style={{
                        ...bodyCell,
                        textAlign: "left",
                        fontWeight: 700,
                      }}
                    >
                      {p.name}
                      {!p.isMember && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "10px",
                            color: t.textMuted,
                            fontWeight: 400,
                          }}
                          title="Jogador convidado (sem cadastro)"
                        >
                          (convidado)
                        </span>
                      )}
                    </td>
                    <td style={bodyCell}>{p.firsts || "—"}</td>
                    <td style={bodyCell}>{p.podium23 || "—"}</td>
                    <td style={bodyCell}>{p.finalTables}</td>
                    <td style={bodyCell}>{p.tournaments}</td>
                    <td
                      style={{
                        ...bodyCell,
                        paddingRight: "16px",
                        fontWeight: 800,
                        color: "#ef4444",
                      }}
                    >
                      {p.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "14px 16px",
          background: t.containerBg,
          border: `1px solid ${t.border}`,
          borderRadius: "12px",
          fontFamily: "'Fira Mono', monospace",
          fontSize: "11px",
          color: t.textMuted,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ marginBottom: "6px", color: t.textInactive, fontWeight: 700 }}>
          Pontuação (estilo WSOP):
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {Object.entries(WSOP_POINTS).map(([place, pts]) => (
            <span key={place}>
              {place}º <strong style={{ color: t.text }}>{pts}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
