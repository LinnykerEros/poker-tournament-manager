// Espera jogadores no formato local (mapDbPlayerToLocal).
export function calculatePrizePool(players, config) {
  if (!players?.length || !config) return 0;
  const regularPlayers = players.filter((p) => !p.isDoubleBuyIn).length;
  const doublePlayers = players.filter((p) => p.isDoubleBuyIn).length;
  const totalBuyIns = regularPlayers * (config.buyIn || 0) + doublePlayers * (config.doubleBuyInCost || (config.buyIn || 0) * 2);
  const totalAddOns = players.reduce((s, p) => s + (p.addOns || 0), 0) * (config.addOnCost || 0);
  const totalRebuys = players.reduce((s, p) => s + (p.rebuys || 0), 0) * (config.rebuyCost || 0);
  const totalDoubleRebuys = players.reduce((s, p) => s + (p.doubleRebuys || 0), 0) * (config.doubleRebuyCost || (config.rebuyCost || 0) * 2);
  return totalBuyIns + totalAddOns + totalRebuys + totalDoubleRebuys;
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
    isDoubleBuyIn: dbPlayer.is_double_buy_in,
    doubleRebuys: dbPlayer.double_rebuys || 0,
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
    is_double_buy_in: localPlayer.isDoubleBuyIn,
    double_rebuys: localPlayer.doubleRebuys,
    eliminated: localPlayer.eliminated,
    place: localPlayer.place,
    eliminated_at: localPlayer.eliminatedAt,
  };
}
