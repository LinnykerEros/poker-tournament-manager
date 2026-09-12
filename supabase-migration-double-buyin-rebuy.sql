-- Migration: Buy-in Duplo e Rebuy Duplo
-- Execute no SQL Editor do Supabase Dashboard

-- Flag que indica se o jogador fez buy-in duplo
ALTER TABLE public.tournament_players
  ADD COLUMN IF NOT EXISTS is_double_buy_in boolean NOT NULL DEFAULT false;

-- Contador de rebuys duplos
ALTER TABLE public.tournament_players
  ADD COLUMN IF NOT EXISTS double_rebuys integer NOT NULL DEFAULT 0;
