# Proposta: gerador configurável de estrutura de blinds

> Status: **proposta, não implementada**. Levantada em 01/08/2026.
> Nada de código foi escrito para isso ainda.

## Objetivo

Substituir a tabela de blinds escrita à mão por um gerador: o usuário informa o
ponto de partida e as regras de escalonamento, e o app monta os níveis sozinho —
com regras diferentes por faixa de níveis, não uma regra única pro torneio todo.

Parâmetros pedidos:

1. **Blind inicial** — digita `50`, vira `50/100` (big = 2× small)
2. **Ritmo de escalonamento** — dobro, triplo, etc.
3. **Ritmo por faixa** — do nível 1 ao 6 um ritmo, do 7 em diante outro

## Os dois achados do desenho

### 1. São dois tipos de escalonamento, não um

O exemplo do usuário usa os dois modos sem perceber:

- Níveis baixos (50/100, 150/300, 200/400): incremento de **valor fixo** no small
- Níveis altos (500/1000 → 1000/2000): **fator** multiplicativo

Só "dobro/triplo" não cobre os níveis iniciais. O gerador precisa dos dois modos.

### 2. Uma faixa pode reiniciar em vez de continuar

"A partir do 6, quero 500/1000" — se a faixa anterior terminou em 300/600, o 500
é um **reinício**, não continuação. Mesmo padrão que já existe na estrutura
manual atual (nível 10 = 1.000/2.000, nível 11 salta pra 2.000/4.000).

Cada faixa precisa de um `startSmall` opcional: preenchido reinicia, vazio continua.

## Estrutura de dados

Mora no `config` jsonb do torneio, ao lado do `autoExtendBlinds`. **Sem migração
de schema** — `config` já é jsonb livre.

```jsonc
config.blindGenerator = {
  "startSmall": 50,          // nível 1 = 50/100
  "bigMultiplier": 2,        // big = small × 2
  "anteFromLevel": 7,        // ante começa aqui
  "anteMode": "big",         // ante = big blind
  "bands": [
    { "fromLevel": 1,  "mode": "add",  "value": 50,   "duration": 15 },
    { "fromLevel": 7,  "mode": "mult", "value": 1.25, "duration": 15, "startSmall": 400 },
    { "fromLevel": 16, "mode": "mult", "value": 1.3,  "duration": 20 }
  ]
}
```

Cada faixa vale do `fromLevel` até o começo da próxima. A última é aberta — é ela
que alimenta a geração automática dos níveis 19, 20, 21…

## Ganho de arquitetura

Hoje `src/utils/blindProgression.js` (`nextBlindLevel`) **infere** o ritmo olhando
os dois últimos níveis. Com o gerador ele passa a **consultar a última faixa**:
vira determinístico em vez de adivinhado, e o gerador e a extensão automática
viram a mesma função — elimina duplicação em vez de criar uma segunda fonte de
verdade.

## UI

Bloco "Gerador de estrutura" no topo da aba Blinds:

- Inputs de cabeçalho (blind inicial, big multiplier, ante a partir de)
- Lista de faixas com botão `+ FAIXA`
- Botão **Pré-visualizar** → tabela de preview abaixo
- Só grava ao confirmar; edição manual continua funcionando por cima do resultado

## Decisões em aberto

1. **Níveis 1-6 do exemplo** — foi soma de +50 (50, 100, 150, 200, 250, 300) com o
   100/200 pulado na digitação, ou é sequência irregular mesmo?
   **Esta é a que trava o modelo.**
2. **Big = 2× small sempre**, ou proporção configurável?
3. **Arredondamento** — 1,25× de 750 = 937,5 → 900, 950 ou 1.000?
   Sugestão: reaproveitar o `roundNice` de `blindProgression.js`.
4. **Regenerar com torneio rodando** — refaz só níveis futuros (sugerido) ou tudo?
5. **Intervalos** — break automático a cada N níveis, ou manual como hoje?
6. **Template salvo** — reaproveitar config entre torneios. Maior ganho real da
   feature, mas exige tabela nova (`blind_templates`) e migração.

## Fatiamento sugerido

- **Fase 1** — gerador com faixas gravando em `config`. ~90% do valor, zero migração.
- **Fase 2** — templates salvos e reaproveitáveis entre torneios. Aí sim tabela nova.
