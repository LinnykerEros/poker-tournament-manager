export const DEFAULT_BLINDS = [
  { level: 1, small: 100, big: 200, ante: 200, duration: 20 },
  { level: 2, small: 100, big: 300, ante: 300, duration: 20 },
  { level: 3, small: 200, big: 400, ante: 400, duration: 20 },
  { level: 4, small: 200, big: 500, ante: 500, duration: 20 },
  { level: 5, small: 300, big: 600, ante: 600, duration: 20 },
  { level: 6, small: 400, big: 800, ante: 800, duration: 20 },
  { level: 7, small: 500, big: 1000, ante: 1000, duration: 20 },
  { level: 8, small: 600, big: 1200, ante: 1200, duration: 20 },
  { level: 9, small: 800, big: 1600, ante: 1600, duration: 20 },
  { level: 10, small: 1000, big: 2000, ante: 2000, duration: 20 },
  { level: 11, small: 1000, big: 2500, ante: 2500, duration: 20 },
  { level: 12, small: 1500, big: 3000, ante: 3000, duration: 15 },
  { level: 13, small: 2000, big: 4000, ante: 4000, duration: 15 },
  { level: 14, small: 2500, big: 5000, ante: 5000, duration: 15 },
  { level: 15, small: 3000, big: 6000, ante: 6000, duration: 15 },
  { level: 16, small: 4000, big: 8000, ante: 8000, duration: 15 },
  { level: 17, small: 5000, big: 10000, ante: 10000, duration: 15 },
  { level: 18, small: 6000, big: 12000, ante: 12000, duration: 15 },
  { level: 19, small: 8000, big: 16000, ante: 16000, duration: 15 },
  { level: 20, small: 10000, big: 20000, ante: 20000, duration: 15 },
  { level: 21, small: 12000, big: 24000, ante: 24000, duration: 15 },
  { level: 22, small: 15000, big: 30000, ante: 30000, duration: 15 },
  { level: 23, small: 20000, big: 40000, ante: 40000, duration: 15 },
  { level: 24, small: 25000, big: 50000, ante: 50000, duration: 15 },
  { level: 25, small: 30000, big: 60000, ante: 60000, duration: 15 },
  { level: 26, small: 40000, big: 80000, ante: 80000, duration: 15 },
  { level: 27, small: 50000, big: 100000, ante: 100000, duration: 15 },
  { level: 28, small: 60000, big: 120000, ante: 120000, duration: 15 },
  { level: 29, small: 80000, big: 160000, ante: 160000, duration: 15 },
  { level: 30, small: 100000, big: 200000, ante: 200000, duration: 15 },
  { level: 31, small: 125000, big: 250000, ante: 250000, duration: 15 },
  { level: 32, small: 150000, big: 300000, ante: 300000, duration: 15 },
  { level: 33, small: 200000, big: 400000, ante: 400000, duration: 15 },
  { level: 34, small: 250000, big: 500000, ante: 500000, duration: 15 },
  { level: 35, small: 300000, big: 600000, ante: 600000, duration: 15 },
];

export const SATELLITE_BLINDS = [
  { level: 1, small: 100, big: 200, ante: 200, duration: 10 },
  { level: 2, small: 150, big: 300, ante: 300, duration: 10 },
  { level: 3, small: 200, big: 400, ante: 400, duration: 10 },
  { level: 4, small: 250, big: 500, ante: 500, duration: 10 },
  { level: 5, small: 300, big: 600, ante: 600, duration: 10 },
  { level: 6, small: 400, big: 800, ante: 800, duration: 10 },
  { level: 7, small: 500, big: 1000, ante: 1000, duration: 10 },
  { level: 8, small: 600, big: 1200, ante: 1200, duration: 10 },
  { level: 9, small: 800, big: 1600, ante: 1600, duration: 10 },
  { level: 10, small: 1000, big: 2000, ante: 2000, duration: 10 },
  { level: 11, small: 1200, big: 2400, ante: 2400, duration: 10 },
  { level: 12, small: 1500, big: 3000, ante: 3000, duration: 10 },
  { level: 13, small: 2000, big: 4000, ante: 4000, duration: 10 },
  { level: 14, small: 2500, big: 5000, ante: 5000, duration: 10 },
  { level: 15, small: 3000, big: 6000, ante: 6000, duration: 10 },
  { level: 16, small: 4000, big: 8000, ante: 8000, duration: 10 },
];

export const BLIND_PRESETS = [
  { key: "padrao", label: "Padrão", blinds: DEFAULT_BLINDS },
  { key: "satelite", label: "Satélite", blinds: SATELLITE_BLINDS },
];

export const DEFAULT_PRIZE_STRUCTURE = [
  { place: 1, percent: 50 },
  { place: 2, percent: 30 },
  { place: 3, percent: 20 },
];

export const SUITS = ["♠", "♥", "♦", "♣"];
export const PLACE_MEDALS = ["🥇", "🥈", "🥉"];
