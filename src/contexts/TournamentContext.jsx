import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { mapDbPlayerToLocal } from "../utils/tournamentHelpers.js";
import { calculateDriftedSeconds } from "../utils/tournamentHelpers.js";

const TournamentContext = createContext();

export function TournamentProvider({ tournamentId, children }) {
  const { session } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const checkpointRef = useRef(null);

  const isOrganizer = !!(session?.user?.id && tournament?.organizer_id && session.user.id === tournament.organizer_id);

  const config = tournament?.config || {};
  const blinds = tournament?.blinds || [];
  const prizeStructure = tournament?.prize_structure || [];
  const currentLevel = tournament?.current_level || 0;
  const secondsLeft = tournament?.seconds_left || 0;
  const running = tournament?.timer_running || false;

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  async function loadData() {
    try {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        supabase.from("tournaments").select("*").eq("id", tournamentId).single(),
        supabase
          .from("tournament_players")
          .select("*, profiles(display_name, avatar_url)")
          .eq("tournament_id", tournamentId)
          .order("joined_at", { ascending: true }),
      ]);

      if (tRes.error) throw tRes.error;
      if (pRes.error) throw pRes.error;

      const t = tRes.data;
      const correctedSeconds = calculateDriftedSeconds(
        t.seconds_left,
        t.timer_running,
        t.timer_updated_at
      );
      setTournament({ ...t, seconds_left: correctedSeconds });
      setPlayers(pRes.data.map(mapDbPlayerToLocal));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const updateTournamentField = useCallback(
    async (fields) => {
      setTournament((prev) => (prev ? { ...prev, ...fields } : prev));
      const { error: err } = await supabase
        .from("tournaments")
        .update(fields)
        .eq("id", tournamentId);
      if (err) console.error("Erro ao salvar torneio:", err.message);
    },
    [tournamentId]
  );

  const setConfig = useCallback(
    (updater) => {
      setTournament((prev) => {
        if (!prev) return prev;
        const newConfig = typeof updater === "function" ? updater(prev.config) : updater;
        supabase
          .from("tournaments")
          .update({ config: newConfig })
          .eq("id", tournamentId)
          .then(({ error: err }) => {
            if (err) console.error("Erro ao salvar config:", err.message);
          });
        return { ...prev, config: newConfig };
      });
    },
    [tournamentId]
  );

  const setBlinds = useCallback(
    (updater) => {
      setTournament((prev) => {
        if (!prev) return prev;
        const newBlinds = typeof updater === "function" ? updater(prev.blinds) : updater;
        supabase
          .from("tournaments")
          .update({ blinds: newBlinds })
          .eq("id", tournamentId)
          .then(({ error: err }) => {
            if (err) console.error("Erro ao salvar blinds:", err.message);
          });
        return { ...prev, blinds: newBlinds };
      });
    },
    [tournamentId]
  );

  const setPrizeStructure = useCallback(
    (updater) => {
      setTournament((prev) => {
        if (!prev) return prev;
        const newPrize = typeof updater === "function" ? updater(prev.prize_structure) : updater;
        supabase
          .from("tournaments")
          .update({ prize_structure: newPrize })
          .eq("id", tournamentId)
          .then(({ error: err }) => {
            if (err) console.error("Erro ao salvar premiação:", err.message);
          });
        return { ...prev, prize_structure: newPrize };
      });
    },
    [tournamentId]
  );

  const setCurrentLevel = useCallback(
    (updater) => {
      setTournament((prev) => {
        if (!prev) return prev;
        const newLevel = typeof updater === "function" ? updater(prev.current_level) : updater;
        return { ...prev, current_level: newLevel };
      });
    },
    []
  );

  const setSecondsLeft = useCallback(
    (updater) => {
      setTournament((prev) => {
        if (!prev) return prev;
        const newSecs = typeof updater === "function" ? updater(prev.seconds_left) : updater;
        return { ...prev, seconds_left: newSecs };
      });
    },
    []
  );

  const setRunning = useCallback(
    (val) => {
      const newVal = typeof val === "function" ? val(running) : val;
      setTournament((prev) => (prev ? { ...prev, timer_running: newVal } : prev));
      supabase
        .from("tournaments")
        .update({
          timer_running: newVal,
          seconds_left: secondsLeft,
          current_level: currentLevel,
          timer_updated_at: new Date().toISOString(),
          status: newVal ? "running" : "paused",
          started_at: newVal && !tournament?.started_at ? new Date().toISOString() : tournament?.started_at,
        })
        .eq("id", tournamentId)
        .then(({ error: err }) => {
          if (err) console.error("Erro ao salvar timer:", err.message);
        });
    },
    [tournamentId, secondsLeft, currentLevel, running, tournament?.started_at]
  );

  // Checkpoint do timer a cada 15 segundos quando rodando
  useEffect(() => {
    if (!running || !tournamentId) {
      if (checkpointRef.current) clearInterval(checkpointRef.current);
      return;
    }

    checkpointRef.current = setInterval(() => {
      setTournament((prev) => {
        if (!prev) return prev;
        supabase
          .from("tournaments")
          .update({
            seconds_left: prev.seconds_left,
            current_level: prev.current_level,
            timer_updated_at: new Date().toISOString(),
          })
          .eq("id", tournamentId)
          .then(({ error: err }) => {
            if (err) console.error("Checkpoint error:", err.message);
          });
        return prev;
      });
    }, 15000);

    return () => clearInterval(checkpointRef.current);
  }, [running, tournamentId]);

  const addPlayerToTournament = useCallback(
    async (playerId, playerName) => {
      const { data, error: err } = await supabase
        .from("tournament_players")
        .insert({
          tournament_id: tournamentId,
          player_id: playerId,
          player_name: playerName,
          stack: config.startingStack || 10000,
        })
        .select("*, profiles(display_name, avatar_url)")
        .single();
      if (err) throw err;
      setPlayers((prev) => [...prev, mapDbPlayerToLocal(data)]);
      return data;
    },
    [tournamentId, config.startingStack]
  );

  const removePlayerFromTournament = useCallback(
    async (tpId) => {
      const { error: err } = await supabase
        .from("tournament_players")
        .delete()
        .eq("id", tpId);
      if (err) throw err;
      setPlayers((prev) => prev.filter((p) => p.id !== tpId));
    },
    []
  );

  const updatePlayerInTournament = useCallback(
    async (tpId, fields) => {
      const dbFields = {};
      if (fields.stack !== undefined) dbFields.stack = fields.stack;
      if (fields.addOns !== undefined) dbFields.add_ons = fields.addOns;
      if (fields.rebuys !== undefined) dbFields.rebuys = fields.rebuys;
      if (fields.hasStartChip !== undefined) dbFields.has_start_chip = fields.hasStartChip;
      if (fields.eliminated !== undefined) dbFields.eliminated = fields.eliminated;
      if (fields.place !== undefined) dbFields.place = fields.place;
      if (fields.eliminatedAt !== undefined) dbFields.eliminated_at = fields.eliminatedAt;

      setPlayers((prev) =>
        prev.map((p) => (p.id === tpId ? { ...p, ...fields } : p))
      );

      const { error: err } = await supabase
        .from("tournament_players")
        .update(dbFields)
        .eq("id", tpId);
      if (err) console.error("Erro ao atualizar jogador:", err.message);
    },
    []
  );

  return (
    <TournamentContext.Provider
      value={{
        tournament,
        players,
        loading,
        error,
        config,
        blinds,
        prizeStructure,
        currentLevel,
        secondsLeft,
        running,
        isOrganizer,
        setConfig,
        setBlinds,
        setPrizeStructure,
        setCurrentLevel,
        setSecondsLeft,
        setRunning,
        updateTournamentField,
        addPlayerToTournament,
        removePlayerFromTournament,
        updatePlayerInTournament,
        reload: loadData,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournamentContext() {
  return useContext(TournamentContext);
}
