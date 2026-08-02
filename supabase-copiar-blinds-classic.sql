-- =====================================================================
-- Copiar a estrutura de blinds do "BLINDS SIMULAÇÃO" para o
-- "CLASSIC TOURNEY 1.0"
--
-- Feito por cópia (SELECT da origem), não por JSON colado: o Classic fica
-- idêntico ao que estiver gravado no blinds simulação no momento da
-- execução, inclusive ajustes manuais feitos pela aba Blinds.
--
-- PRÉ-REQUISITO: o supabase-blinds-simulacao.sql já precisa ter sido
-- rodado. Se não foi, este script copia a estrutura ANTIGA. O passo 1
-- mostra o que está lá para você conferir antes.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PASSO 1 — CONFERÊNCIA (não altera nada)
-- Veja os dois lado a lado. A origem precisa estar com 18 níveis e
-- primeiro_big = 100. Se não estiver, PARE e rode antes o
-- supabase-blinds-simulacao.sql.
-- ---------------------------------------------------------------------
SELECT
  name,
  jsonb_array_length(blinds)    AS total_niveis,
  blinds -> 0 ->> 'small'       AS primeiro_small,
  blinds -> 0 ->> 'big'         AS primeiro_big,
  status,
  current_level
FROM public.tournaments
WHERE name ILIKE '%blind%simula%'
   OR name ILIKE '%classic%'
ORDER BY name;


-- ---------------------------------------------------------------------
-- PASSO 2 — CÓPIA (só rode após conferir o passo 1)
-- Destino: apenas o Classic. Origem: apenas o blinds simulação.
-- ---------------------------------------------------------------------
UPDATE public.tournaments AS destino
SET blinds = (
  SELECT origem.blinds
  FROM public.tournaments AS origem
  WHERE origem.name ILIKE '%blind%simula%'
    AND origem.name NOT ILIKE '%classic%'
  LIMIT 1
)
WHERE destino.name ILIKE '%classic%';


-- ---------------------------------------------------------------------
-- PASSO 3 — OPCIONAL: ligar também a geração automática de níveis
-- O passo 2 copia SÓ as blinds. Se você quer o Classic se comportando
-- igual em tudo, incluindo criar níveis sozinho depois do 18, rode isto.
-- ---------------------------------------------------------------------
-- UPDATE public.tournaments
-- SET config = config || '{"autoExtendBlinds": true}'::jsonb
-- WHERE name ILIKE '%classic%';


-- ---------------------------------------------------------------------
-- PASSO 4 — OPCIONAL: realinhar o relógio
--
-- Rode SOMENTE se o Classic estiver no meio de um torneio. Trocar a
-- estrutura não move o current_level: se ele estava no nível 12, continua
-- no 12, mas o 12 agora vale outra blind. Isto devolve ele ao nível 1 com
-- 15 min (900s) no relógio.
-- ---------------------------------------------------------------------
-- UPDATE public.tournaments
-- SET current_level = 0,
--     seconds_left = 900,
--     timer_running = false
-- WHERE name ILIKE '%classic%';


-- ---------------------------------------------------------------------
-- PASSO 5 — CONFERÊNCIA FINAL
-- As duas linhas devem sair com os mesmos números.
-- ---------------------------------------------------------------------
SELECT
  name,
  jsonb_array_length(blinds)     AS total_niveis,
  blinds -> 0  ->> 'big'         AS primeiro_big,
  blinds -> 17 ->> 'big'         AS ultimo_big,
  config ->> 'autoExtendBlinds'  AS auto_extend
FROM public.tournaments
WHERE name ILIKE '%blind%simula%'
   OR name ILIKE '%classic%'
ORDER BY name;
