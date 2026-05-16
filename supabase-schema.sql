-- =====================================================
-- 2Z Poker — Supabase Schema (Fase 1)
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. TABELA: profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer autenticado lê profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuário atualiza próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. TABELA: tournaments
CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES public.profiles(id),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'running', 'paused', 'finished')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  blinds jsonb NOT NULL DEFAULT '[]'::jsonb,
  prize_structure jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_level integer NOT NULL DEFAULT 0,
  seconds_left integer NOT NULL DEFAULT 0,
  timer_running boolean NOT NULL DEFAULT false,
  timer_updated_at timestamptz,
  total_prize_pool numeric(10,2) DEFAULT 0,
  season_id uuid,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer autenticado lê torneios"
  ON public.tournaments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Autenticado cria torneio"
  ON public.tournaments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizador atualiza torneio"
  ON public.tournaments FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizador deleta torneio em setup"
  ON public.tournaments FOR DELETE
  TO authenticated
  USING (organizer_id = auth.uid() AND status = 'setup');

-- 3. TABELA: tournament_players
CREATE TABLE public.tournament_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id),
  player_name text NOT NULL DEFAULT '',
  stack integer NOT NULL DEFAULT 0,
  add_ons integer NOT NULL DEFAULT 0,
  rebuys integer NOT NULL DEFAULT 0,
  eliminated boolean NOT NULL DEFAULT false,
  place integer,
  eliminated_at timestamptz,
  prize_amount numeric(10,2) DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, player_id)
);

ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer autenticado lê tournament_players"
  ON public.tournament_players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizador insere jogadores"
  ON public.tournament_players FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizador atualiza jogadores"
  ON public.tournament_players FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizador remove jogadores"
  ON public.tournament_players FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND organizer_id = auth.uid()
    )
  );

-- 4. TRIGGER: Criar profile automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Habilitar Realtime nas tabelas necessárias
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_players;

-- 6. Índices úteis
CREATE INDEX idx_tournaments_organizer ON public.tournaments(organizer_id);
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournament_players_tournament ON public.tournament_players(tournament_id);
CREATE INDEX idx_tournament_players_player ON public.tournament_players(player_id);
