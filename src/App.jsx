import { ThemeProvider } from "./theme.jsx";
import PokerTournament from "./components/PokerTournament.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <PokerTournament />
    </ThemeProvider>
  );
}
