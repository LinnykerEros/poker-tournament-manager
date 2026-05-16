export function calculatePrizePool(players, config) {
  const totalBuyIns = players.length * config.buyIn;
  const totalAddOns = players.reduce((s, p) => s + p.add_ons, 0) * config.addOnCost;
  const totalRebuys = players.reduce((s, p) => s + p.rebuys, 0) * config.rebuyCost;
  return totalBuyIns + totalAddOns + totalRebuys;
}

export function calculateDriftedSeconds(secondsLeft, timerRunning, timerUpdatedAt) {
  if (!timerRunning || !timerUpdatedAt) return secondsLeft;
  const elapsed = Math.floor((Date.now() - new Date(timerUpdatedAt).getTime()) / 1000);
  return Math.max(0, secondsLeft - elapsed);
}

export function mapDbPlayerToLocal(dbPlayer) {
  return {
    id: dbPlayer.id,
    playerId: dbPlayer.player_id,
    name: dbPlayer.player_name,
    stack: dbPlayer.stack,
    addOns: dbPlayer.add_ons,
    rebuys: dbPlayer.rebuys,
    eliminated: dbPlayer.eliminated,
    place: dbPlayer.place,
    eliminatedAt: dbPlayer.eliminated_at,
  };
}

export function mapLocalPlayerToDb(localPlayer) {
  return {
    stack: localPlayer.stack,
    add_ons: localPlayer.addOns,
    rebuys: localPlayer.rebuys,
    eliminated: localPlayer.eliminated,
    place: localPlayer.place,
    eliminated_at: localPlayer.eliminatedAt,
  };
}
