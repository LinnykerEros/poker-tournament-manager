# Poker Tournament Manager

Gerenciador de torneios de poker em React + Vite — timer com blinds, controle de jogadores, ranking, premiação e estrutura customizável.

## Funcionalidades

- **Timer** com cronômetro circular, alertas sonoros (60s/30s/10s/5s) e modo tela cheia
- **Jogadores** — adicionar, eliminar, add-on, rebuy, ranking automático por ordem de eliminação
- **Ranking** com pódio, premiação calculada por percentual e destaque para o campeão
- **Blinds** editáveis, com auto-progressão de níveis e intervalos arrastáveis (drag-and-drop)
- **Config** — stacks iniciais, custos, buy-in, estrutura de premiação com validação de 100%
- **Responsivo** — usa `clamp()` e SVG dinâmico para adaptar de 320px até desktop

## Como rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173/ automaticamente.

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
├── components/
│   ├── PokerTournament.jsx     # Componente pai (estado central + roteamento de tabs)
│   ├── tabs/
│   │   ├── TimerTab.jsx
│   │   ├── PlayersTab.jsx
│   │   ├── RankingTab.jsx
│   │   ├── BlindsTab.jsx
│   │   └── ConfigTab.jsx
│   └── shared/
│       ├── TabBtn.jsx
│       ├── MiniBtn.jsx
│       ├── NumInput.jsx
│       ├── PlayerCard.jsx
│       └── CardSuitBg.jsx
├── utils/
│   ├── constants.js   # DEFAULT_BLINDS, DEFAULT_PRIZE_STRUCTURE, SUITS, PLACE_MEDALS
│   ├── formatters.js  # formatTime, formatChips, formatMoney
│   └── hooks.js       # useWindowWidth
├── styles/
│   └── shared.js      # estilos compartilhados de botões/tabela
├── App.jsx
└── main.jsx
```

## Stack

- React 18
- Vite 5
- Estilos inline + `clamp()` para responsividade
- Web Audio API para alertas sonoros
