-- Migration: Permitir jogadores avulsos (sem login/perfil)
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Remover constraint NOT NULL e UNIQUE antigos
ALTER TABLE public.tournament_players ALTER COLUMN player_id DROP NOT NULL;

-- 2. Remover UNIQUE constraint antigo (tournament_id, player_id)
ALTER TABLE public.tournament_players DROP CONSTRAINT IF EXISTS tournament_players_tournament_id_player_id_key;

-- 3. Criar UNIQUE parcial: apenas para jogadores com perfil (evita duplicata de membro no mesmo torneio)
CREATE UNIQUE INDEX idx_unique_tournament_player
  ON public.tournament_players(tournament_id, player_id)
  WHERE player_id IS NOT NULL;
