-- =====================================================================
-- Estrutura de blinds do torneio "BLINDS SIMULAÇÃO"
--
--   - 18 níveis, começando em 50/100
--   - Sem ante nos níveis 1 a 6
--   - Do nível 7 em diante, ante igual à big blind
--   - Níveis 1 a 10 (até o fim do registro tardio): 15 min
--   - Níveis 11 a 15: 15 min, retomando mais alto em 2000/4000
--   - Níveis 16 em diante: 20 min
--   - Geração automática de níveis ligada (autoExtendBlinds)
--
-- ATENÇÃO: execute os passos NA ORDEM. O passo 1 é uma conferência.
-- Só rode o passo 2 depois que o passo 1 retornar EXATAMENTE 1 linha,
-- e que essa linha seja o "blinds simulação".
-- =====================================================================


-- ---------------------------------------------------------------------
-- PASSO 1 — CONFERÊNCIA (não altera nada)
-- ---------------------------------------------------------------------
SELECT
  id,
  name,
  status,
  created_at,
  jsonb_array_length(blinds) AS niveis_hoje
FROM public.tournaments
ORDER BY created_at DESC;

-- Filtro exato que os UPDATEs vão usar.
-- Precisa retornar 1 linha só, e ser o "blinds simulação":
SELECT id, name, status
FROM public.tournaments
WHERE name ILIKE '%blind%simula%'
  AND name NOT ILIKE '%classic%';


-- ---------------------------------------------------------------------
-- PASSO 2 — ESTRUTURA DE BLINDS (só rode após conferir o passo 1)
--
-- Trava dupla no filtro:
--   - pega apenas nomes que casam com "blind...simula"
--   - exclui explicitamente qualquer nome com "classic"
-- O Classic Tourney 1.0 não é atingido por este comando.
-- ---------------------------------------------------------------------
UPDATE public.tournaments
SET blinds = '[
  {"level": 1,  "small": 50,   "big": 100,   "ante": 0,     "duration": 15},
  {"level": 2,  "small": 100,  "big": 200,   "ante": 0,     "duration": 15},
  {"level": 3,  "small": 150,  "big": 300,   "ante": 0,     "duration": 15},
  {"level": 4,  "small": 200,  "big": 400,   "ante": 0,     "duration": 15},
  {"level": 5,  "small": 250,  "big": 500,   "ante": 0,     "duration": 15},
  {"level": 6,  "small": 300,  "big": 600,   "ante": 0,     "duration": 15},
  {"level": 7,  "small": 400,  "big": 800,   "ante": 800,   "duration": 15},
  {"level": 8,  "small": 500,  "big": 1000,  "ante": 1000,  "duration": 15},
  {"level": 9,  "small": 750,  "big": 1500,  "ante": 1500,  "duration": 15},
  {"level": 10, "small": 1000, "big": 2000,  "ante": 2000,  "duration": 15},
  {"level": 11, "small": 2000,  "big": 4000,  "ante": 4000,  "duration": 15},
  {"level": 12, "small": 2500,  "big": 5000,  "ante": 5000,  "duration": 15},
  {"level": 13, "small": 3000,  "big": 6000,  "ante": 6000,  "duration": 15},
  {"level": 14, "small": 4000,  "big": 8000,  "ante": 8000,  "duration": 15},
  {"level": 15, "small": 5000,  "big": 10000, "ante": 10000, "duration": 15},
  {"level": 16, "small": 6000,  "big": 12000, "ante": 12000, "duration": 20},
  {"level": 17, "small": 8000,  "big": 16000, "ante": 16000, "duration": 20},
  {"level": 18, "small": 10000, "big": 20000, "ante": 20000, "duration": 20}
]'::jsonb
WHERE name ILIKE '%blind%simula%'
  AND name NOT ILIKE '%classic%';


-- ---------------------------------------------------------------------
-- PASSO 3 — LIGAR A GERAÇÃO AUTOMÁTICA DE NÍVEIS
--
-- Sem esta flag o app NÃO cria níveis sozinho. É ela que garante que o
-- comportamento novo vale só para o blinds simulação: o Classic Tourney
-- 1.0 fica sem a flag e segue parando no último nível, como sempre foi.
-- ---------------------------------------------------------------------
UPDATE public.tournaments
SET config = config || '{"autoExtendBlinds": true}'::jsonb
WHERE name ILIKE '%blind%simula%'
  AND name NOT ILIKE '%classic%';


-- ---------------------------------------------------------------------
-- PASSO 4 — OPCIONAL: reiniciar o relógio no nível 1
-- Rode apenas se o torneio ainda NÃO começou e você quer o timer
-- zerado em 15 min (900s), coerente com o novo nível 1.
-- ---------------------------------------------------------------------
-- UPDATE public.tournaments
-- SET current_level = 0,
--     seconds_left = 900,
--     timer_running = false
-- WHERE name ILIKE '%blind%simula%'
--   AND name NOT ILIKE '%classic%';


-- ---------------------------------------------------------------------
-- PASSO 5 — CONFERÊNCIA FINAL
-- O blinds simulação deve aparecer com 18 níveis e auto_extend = true.
-- O Classic Tourney 1.0 deve aparecer com auto_extend nulo/false.
-- ---------------------------------------------------------------------
SELECT
  name,
  jsonb_array_length(blinds)   AS total_niveis,
  blinds -> 0  ->> 'big'       AS primeiro_big,
  blinds -> 17 ->> 'big'       AS ultimo_big,
  config ->> 'autoExtendBlinds' AS auto_extend
FROM public.tournaments
ORDER BY created_at DESC;
