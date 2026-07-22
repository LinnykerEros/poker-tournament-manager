-- Migration: StartChip (compra opcional única na entrada do torneio)
-- Execute no SQL Editor do Supabase Dashboard

-- Flag que indica se o jogador comprou o startchip (só pode comprar uma vez, na entrada)
ALTER TABLE public.tournament_players
  ADD COLUMN IF NOT EXISTS has_start_chip boolean NOT NULL DEFAULT false;
