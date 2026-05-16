import { PLACE_MEDALS } from "../../utils/constants.js";
import { formatChips, formatMoney } from "../../utils/formatters.js";

export default function RankingTab({ players, config, prizeStructure }) {
  const totalBuyIns = players.length * config.buyIn;
  const totalAddOns = players.reduce((s, p) => s + p.addOns, 0) * config.addOnCost;
  const totalRebuys = players.reduce((s, p) => s + p.rebuys, 0) * config.rebuyCost;
  const totalPrizePool = totalBuyIns + totalAddOns + totalRebuys;

  const eliminated = players.filter((p) => p.eliminated).sort((a, b) => a.place - b.place);
  const active = players.filter((p) => !p.eliminated);
  const champion = active.length === 1 ? active[0] : null;

  const ranked = [];
  if (champion) {
    ranked.push({ ...champion, place: 1 });
    eliminated.forEach((p) => ranked.push(p));
  } else {
    eliminated.forEach((p) => ranked.push(p));
  }

  return (
    <div>
      {champion && (
        <div
          style={{
            textAlign: "center",
            padding: "24px",
            marginBottom: "24px",
            background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(245,215,110,0.08))",
            border: "2px solid rgba(212,175,55,0.4)",
            borderRadius: "16px",
            animation: "champGlow 2s ease-in-out infinite alternate",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>👑</div>
          <div
            style={{
              color: "#d4af37",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "4px",
              fontFamily: "'Fira Mono', monospace",
              marginBottom: "4px",
            }}
          >
            Campeão
          </div>
          <div
            style={{
              color: "#f5d76e",
              fontSize: "clamp(20px, 6.5vw, 28px)",
              fontWeight: 900,
              fontFamily: "'Fira Mono', monospace",
              wordBreak: "break-word",
            }}
          >
            {champion.name}
          </div>
          <div
            style={{
              color: "#34d399",
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "'Fira Mono', monospace",
              marginTop: "8px",
            }}
          >
            {prizeStructure[0] ? formatMoney((totalPrizePool * prizeStructure[0].percent) / 100) : ""}
          </div>
        </div>
      )}

      {!champion && active.length > 1 && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            marginBottom: "24px",
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.2)",
            borderRadius: "12px",
            color: "#60a5fa",
            fontFamily: "'Fira Mono', monospace",
            fontSize: "13px",
          }}
        >
          🎮 Torneio em andamento — {active.length} jogadores restantes
        </div>
      )}

      {players.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#4a4a62" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏆</div>
          <div style={{ fontFamily: "'Fira Mono', monospace", fontSize: "14px" }}>
            Adicione jogadores para ver o ranking
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {ranked.map((p) => {
          const prize = prizeStructure[p.place - 1];
          const prizeAmount = prize ? (totalPrizePool * prize.percent) / 100 : 0;
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                background:
                  p.place <= 3
                    ? `rgba(212,175,55,${0.12 - (p.place - 1) * 0.03})`
                    : "rgba(255,255,255,0.03)",
                border: `1px solid ${p.place <= 3 ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background:
                    p.place === 1
                      ? "linear-gradient(135deg, #d4af37, #f5d76e)"
                      : p.place === 2
                        ? "linear-gradient(135deg, #9ca3af, #d1d5db)"
                        : p.place === 3
                          ? "linear-gradient(135deg, #b45309, #d97706)"
                          : "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: p.place <= 3 ? "20px" : "13px",
                  fontWeight: 800,
                  color: p.place <= 3 ? "#1a1a2e" : "#6a6a82",
                  fontFamily: "'Fira Mono', monospace",
                  flexShrink: 0,
                }}
              >
                {p.place <= 3 ? PLACE_MEDALS[p.place - 1] : `${p.place}º`}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "#e8e8f0",
                    fontWeight: 700,
                    fontSize: "15px",
                    fontFamily: "'Fira Mono', monospace",
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    color: "#6a6a82",
                    fontSize: "11px",
                    fontFamily: "'Fira Mono', monospace",
                    marginTop: "2px",
                  }}
                >
                  {p.addOns > 0 && `${p.addOns} add-on · `}
                  {p.rebuys > 0 && `${p.rebuys} rebuy · `}
                  Stack: {formatChips(p.stack)}
                </div>
              </div>
              {prizeAmount > 0 && (
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#34d399",
                      fontSize: "16px",
                      fontWeight: 800,
                      fontFamily: "'Fira Mono', monospace",
                    }}
                  >
                    {formatMoney(prizeAmount)}
                  </div>
                  <div
                    style={{
                      color: "#6a6a82",
                      fontSize: "10px",
                      fontFamily: "'Fira Mono', monospace",
                    }}
                  >
                    {prize.percent}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes champGlow { from { box-shadow: 0 0 20px rgba(212,175,55,0.1); } to { box-shadow: 0 0 40px rgba(212,175,55,0.25); } }`}</style>
    </div>
  );
}
