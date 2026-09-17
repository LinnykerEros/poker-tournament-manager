export const DEFAULT_BLINDS = [
  { level: 1, small: 25, big: 50, ante: 0, duration: 20 },
  { level: 2, small: 50, big: 100, ante: 0, duration: 20 },
  { level: 3, small: 75, big: 150, ante: 0, duration: 20 },
  { level: 4, small: 100, big: 200, ante: 25, duration: 20 },
  { level: 5, small: 150, big: 300, ante: 25, duration: 20 },
  { level: 6, small: 200, big: 400, ante: 50, duration: 15 },
  { level: 7, small: 300, big: 600, ante: 75, duration: 15 },
  { level: 8, small: 400, big: 800, ante: 100, duration: 15 },
  { level: 9, small: 500, big: 1000, ante: 100, duration: 15 },
  { level: 10, small: 600, big: 1200, ante: 200, duration: 10 },
  { level: 11, small: 800, big: 1600, ante: 200, duration: 10 },
  { level: 12, small: 1000, big: 2000, ante: 300, duration: 10 },
  { level: 13, small: 1500, big: 3000, ante: 400, duration: 10 },
  { level: 14, small: 2000, big: 4000, ante: 500, duration: 10 },
  { level: 15, small: 3000, big: 6000, ante: 1000, duration: 10 },
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
