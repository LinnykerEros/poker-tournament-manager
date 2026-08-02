// Espera jogadores no formato local (mapDbPlayerToLocal).
export function calculatePrizePool(players, config) {
  if (!players?.length || !config) return 0;
  const totalBuyIns = players.length * (config.buyIn || 0);
  const totalAddOns = players.reduce((s, p) => s + (p.addOns || 0), 0) * (config.addOnCost || 0);
  const totalRebuys = players.reduce((s, p) => s + (p.rebuys || 0), 0) * (config.rebuyCost || 0);
  const totalStartChips =
    players.filter((p) => p.hasStartChip).length * (config.startChipCost || 0);
  return totalBuyIns + totalAddOns + totalRebuys + totalStartChips;
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
    hasStartChip: dbPlayer.has_start_chip,
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
    has_start_chip: localPlayer.hasStartChip,
    eliminated: localPlayer.eliminated,
    place: localPlayer.place,
    eliminated_at: localPlayer.eliminatedAt,
  };
}
