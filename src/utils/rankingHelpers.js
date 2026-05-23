export const WSOP_POINTS = {
  1: 100,
  2: 70,
  3: 50,
  4: 40,
  5: 30,
  6: 25,
  7: 20,
  8: 15,
  9: 10,
};

export function monthRange(year, month) {
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 1, 0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatMonthLabel(year, month) {
  const d = new Date(year, month, 1);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function playerKey(tp) {
  if (tp.player_id) return { key: `m:${tp.player_id}`, isMember: true };
  const name = (tp.player_name || "").trim().toLowerCase();
  return { key: `g:${name}`, isMember: false };
}

function playerName(tp) {
  if (tp.player_id) return tp.profiles?.display_name || tp.player_name || "Sem nome";
  return tp.player_name || "Convidado";
}

export function aggregateRanking(tournaments) {
  const byPlayer = new Map();

  function ensure(tp) {
    const { key, isMember } = playerKey(tp);
    if (!byPlayer.has(key)) {
      byPlayer.set(key, {
        key,
        isMember,
        name: playerName(tp),
        points: 0,
        firsts: 0,
        seconds: 0,
        thirds: 0,
        podium23: 0,
        finalTables: 0,
        tournaments: 0,
      });
    }
    return byPlayer.get(key);
  }

  for (const tour of tournaments) {
    for (const tp of tour.tournament_players || []) {
      if (!tp.player_id && !(tp.player_name || "").trim()) continue;
      const entry = ensure(tp);
      entry.tournaments += 1;
      const place = tp.place;
      if (place >= 1 && place <= 9) {
        entry.points += WSOP_POINTS[place] || 0;
        entry.finalTables += 1;
        if (place === 1) entry.firsts += 1;
        else if (place === 2) {
          entry.seconds += 1;
          entry.podium23 += 1;
        } else if (place === 3) {
          entry.thirds += 1;
          entry.podium23 += 1;
        }
      }
    }
  }

  const ranked = [...byPlayer.values()].filter((p) => p.points > 0);

  ranked.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.firsts !== a.firsts) return b.firsts - a.firsts;
    if (b.seconds !== a.seconds) return b.seconds - a.seconds;
    if (b.thirds !== a.thirds) return b.thirds - a.thirds;
    if (b.finalTables !== a.finalTables) return b.finalTables - a.finalTables;
    if (b.tournaments !== a.tournaments) return b.tournaments - a.tournaments;
    return a.name.localeCompare(b.name, "pt-BR");
  });

  let lastSig = null;
  let lastPos = 0;
  return ranked.map((p, i) => {
    const sig = `${p.points}|${p.firsts}|${p.seconds}|${p.thirds}|${p.finalTables}|${p.tournaments}`;
    const position = sig === lastSig ? lastPos : i + 1;
    lastSig = sig;
    lastPos = position;
    return { ...p, position };
  });
}
