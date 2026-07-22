import { supabase } from "../lib/supabase.js";
import { DEFAULT_BLINDS, DEFAULT_PRIZE_STRUCTURE } from "../utils/constants.js";

export function useTournament() {
  async function listTournaments() {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*, tournament_players(count)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async function createTournament(name) {
    const { data: { user } } = await supabase.auth.getUser();
    const defaultConfig = {
      startingStack: 10000,
      addOnChips: 5000,
      rebuyChips: 10000,
      startChipChips: 5000,
      addOnCost: 20,
      rebuyCost: 30,
      startChipCost: 25,
      buyIn: 50,
    };
    const { data, error } = await supabase
      .from("tournaments")
      .insert({
        organizer_id: user.id,
        name,
        config: defaultConfig,
        blinds: DEFAULT_BLINDS,
        prize_structure: DEFAULT_PRIZE_STRUCTURE,
        seconds_left: DEFAULT_BLINDS[0].duration * 60,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function loadTournament(id) {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async function loadTournamentPlayers(tournamentId) {
    const { data, error } = await supabase
      .from("tournament_players")
      .select("*, profiles(display_name, avatar_url)")
      .eq("tournament_id", tournamentId)
      .order("joined_at", { ascending: true });
    if (error) throw error;
    return data;
  }

  async function updateTournament(id, fields) {
    const { data, error } = await supabase
      .from("tournaments")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteTournament(id) {
    const { error } = await supabase
      .from("tournaments")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  async function addPlayer(tournamentId, playerId, playerName, startingStack) {
    const { data, error } = await supabase
      .from("tournament_players")
      .insert({
        tournament_id: tournamentId,
        player_id: playerId,
        player_name: playerName,
        stack: startingStack,
      })
      .select("*, profiles(display_name, avatar_url)")
      .single();
    if (error) throw error;
    return data;
  }

  async function updatePlayer(playerId, fields) {
    const { data, error } = await supabase
      .from("tournament_players")
      .update(fields)
      .eq("id", playerId)
      .select("*, profiles(display_name, avatar_url)")
      .single();
    if (error) throw error;
    return data;
  }

  async function removePlayer(playerId) {
    const { error } = await supabase
      .from("tournament_players")
      .delete()
      .eq("id", playerId);
    if (error) throw error;
  }

  async function listProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("display_name");
    if (error) throw error;
    return data;
  }

  async function listFinishedTournamentsInRange(startISO, endISO) {
    const { data, error } = await supabase
      .from("tournaments")
      .select(`
        id, name, finished_at,
        tournament_players (
          player_id, player_name, place,
          profiles ( display_name )
        )
      `)
      .eq("status", "finished")
      .gte("finished_at", startISO)
      .lt("finished_at", endISO)
      .order("finished_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  return {
    listTournaments,
    createTournament,
    loadTournament,
    loadTournamentPlayers,
    updateTournament,
    deleteTournament,
    addPlayer,
    updatePlayer,
    removePlayer,
    listProfiles,
    listFinishedTournamentsInRange,
  };
}
