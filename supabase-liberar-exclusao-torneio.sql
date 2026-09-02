-- =====================================================================
-- Exclusão de torneio: liberar para qualquer autenticado, só finalizado
--
-- Antes: só o organizador podia excluir, e só enquanto o torneio estava
-- em 'setup'. Como o sistema é operado por um usuário só, a trava de
-- organizador não protegia nada — e a de 'setup' fazia o ✕ sumir da
-- listagem assim que o torneio começava.
--
-- Agora: qualquer usuário autenticado exclui, mas apenas torneio
-- FINALIZADO. Torneio em setup, em andamento ou pausado não pode ser
-- apagado — protege o torneio ao vivo de um clique errado.
--
-- ATENÇÃO — efeito no ranking:
--   O ranking mensal lê exatamente os torneios finalizados
--   (listFinishedTournamentsInRange filtra status = 'finished'), e
--   tournament_players tem ON DELETE CASCADE em tournament_id. Ou seja,
--   toda exclusão permitida por esta policy apaga os jogadores do
--   torneio e o remove do ranking daquele mês. É o comportamento
--   desejado — serve para limpar torneio de teste. A confirmação no
--   frontend avisa antes.
--
-- A seção REVERTER no fim devolve o comportamento original.
-- =====================================================================


-- ---------------------------------------------------------------------
-- TOURNAMENTS: delete liberado apenas para torneio finalizado
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Organizador deleta torneio em setup" ON public.tournaments;

CREATE POLICY "Autenticado deleta torneio finalizado"
  ON public.tournaments FOR DELETE
  TO authenticated
  USING (status = 'finished');


-- ---------------------------------------------------------------------
-- CONFERÊNCIA
-- ---------------------------------------------------------------------
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'tournaments'
ORDER BY cmd, policyname;


-- =====================================================================
-- REVERTER
--
-- Rode este bloco e volte, em src/pages/DashboardPage.jsx, a condição
-- que envolve o botão de excluir:
--     {tour.status === "setup" && tour.organizer_id === session?.user?.id && (
-- (restaurando também o `const { session } = useAuth();` e o import.)
-- =====================================================================
--
-- DROP POLICY IF EXISTS "Autenticado deleta torneio finalizado" ON public.tournaments;
--
-- CREATE POLICY "Organizador deleta torneio em setup"
--   ON public.tournaments FOR DELETE
--   TO authenticated
--   USING (organizer_id = auth.uid() AND status = 'setup');
