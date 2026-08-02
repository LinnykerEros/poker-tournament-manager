-- =====================================================================
-- TEMPORÁRIO: desligar o modo espectador
--
-- Libera qualquer usuário autenticado a editar qualquer torneio que NÃO
-- esteja finalizado. Sem isto, o frontend mostra os botões mas o Supabase
-- rejeita as gravações — e o app falha em silêncio, só com console.error.
--
-- O que continua restrito ao organizador:
--   - DELETE de torneio (segue organizador + status setup)
--   - Torneio finalizado volta a ser somente leitura para todos
--
-- A seção REVERTER no fim devolve o comportamento original.
-- =====================================================================


-- ---------------------------------------------------------------------
-- TOURNAMENTS: update liberado enquanto não estiver finalizado
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Organizador atualiza torneio" ON public.tournaments;

CREATE POLICY "Autenticado atualiza torneio aberto"
  ON public.tournaments FOR UPDATE
  TO authenticated
  USING (status <> 'finished')
  WITH CHECK (true);


-- ---------------------------------------------------------------------
-- TOURNAMENT_PLAYERS: insert / update / delete liberados
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Organizador insere jogadores" ON public.tournament_players;

CREATE POLICY "Autenticado insere jogadores em torneio aberto"
  ON public.tournament_players FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND status <> 'finished'
    )
  );

DROP POLICY IF EXISTS "Organizador atualiza jogadores" ON public.tournament_players;

CREATE POLICY "Autenticado atualiza jogadores em torneio aberto"
  ON public.tournament_players FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND status <> 'finished'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND status <> 'finished'
    )
  );

DROP POLICY IF EXISTS "Organizador remove jogadores" ON public.tournament_players;

CREATE POLICY "Autenticado remove jogadores de torneio aberto"
  ON public.tournament_players FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND status <> 'finished'
    )
  );


-- ---------------------------------------------------------------------
-- CONFERÊNCIA
-- ---------------------------------------------------------------------
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tournaments', 'tournament_players')
ORDER BY tablename, cmd, policyname;


-- =====================================================================
-- REVERTER (voltar o modo espectador)
--
-- Rode este bloco e troque, em src/contexts/TournamentContext.jsx:
--     const canEdit = !!session?.user?.id && tournament?.status !== "finished";
-- por:
--     const canEdit = isOrganizer;
-- =====================================================================
--
-- DROP POLICY IF EXISTS "Autenticado atualiza torneio aberto" ON public.tournaments;
--
-- CREATE POLICY "Organizador atualiza torneio"
--   ON public.tournaments FOR UPDATE
--   TO authenticated
--   USING (organizer_id = auth.uid())
--   WITH CHECK (organizer_id = auth.uid());
--
-- DROP POLICY IF EXISTS "Autenticado insere jogadores em torneio aberto" ON public.tournament_players;
--
-- CREATE POLICY "Organizador insere jogadores"
--   ON public.tournament_players FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM public.tournaments
--       WHERE id = tournament_id AND organizer_id = auth.uid()
--     )
--   );
--
-- DROP POLICY IF EXISTS "Autenticado atualiza jogadores em torneio aberto" ON public.tournament_players;
--
-- CREATE POLICY "Organizador atualiza jogadores"
--   ON public.tournament_players FOR UPDATE
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.tournaments
--       WHERE id = tournament_id AND organizer_id = auth.uid()
--     )
--   )
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM public.tournaments
--       WHERE id = tournament_id AND organizer_id = auth.uid()
--     )
--   );
--
-- DROP POLICY IF EXISTS "Autenticado remove jogadores de torneio aberto" ON public.tournament_players;
--
-- CREATE POLICY "Organizador remove jogadores"
--   ON public.tournament_players FOR DELETE
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.tournaments
--       WHERE id = tournament_id AND organizer_id = auth.uid()
--     )
--   );
