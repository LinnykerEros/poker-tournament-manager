import { useParams } from "react-router-dom";
import { TournamentProvider } from "../contexts/TournamentContext.jsx";
import PokerTournament from "../components/PokerTournament.jsx";

export default function TournamentPage() {
  const { id } = useParams();

  return (
    <TournamentProvider tournamentId={id}>
      <PokerTournament />
    </TournamentProvider>
  );
}
