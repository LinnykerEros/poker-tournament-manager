// Regra única de progressão de blinds, usada tanto pelo botão "+ NÍVEL"
// da aba Blinds quanto pela geração automática durante o torneio.

// Arredonda para um valor "redondo" de ficha, proporcional à grandeza.
function roundNice(value) {
  if (value < 500) return Math.round(value / 25) * 25;
  if (value < 2000) return Math.round(value / 50) * 50;
  if (value < 10000) return Math.round(value / 100) * 100;
  return Math.round(value / 1000) * 1000;
}

// Ante só entra a partir deste nível; antes disso é zero.
const ANTE_FROM_LEVEL = 7;

// Calcula o próximo nível a partir dos existentes, mantendo o ritmo de
// escalonamento dos dois últimos. Do nível 7 em diante o ante é igual à big.
export function nextBlindLevel(blinds) {
  const levels = (blinds || []).filter((b) => !b.isBreak);

  if (levels.length === 0) {
    return { level: 1, small: 50, big: 100, ante: 0, duration: 15 };
  }

  const last = levels[levels.length - 1];

  // Sem histórico suficiente para inferir ritmo, dobra.
  let ratio = 2;
  if (levels.length >= 2) {
    const prev = levels[levels.length - 2];
    if (prev.small > 0) ratio = last.small / prev.small;
  }
  // Evita ritmo degenerado se alguém editar os níveis na mão.
  ratio = Math.min(2, Math.max(1.2, ratio));

  const small = roundNice(last.small * ratio) || last.small * 2;
  const big = small * 2;
  const level = levels.length + 1;

  return {
    level,
    small,
    big,
    ante: level >= ANTE_FROM_LEVEL ? big : 0,
    duration: last.duration,
  };
}
