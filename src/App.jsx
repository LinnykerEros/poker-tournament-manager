import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./theme.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TournamentPage from "./pages/TournamentPage.jsx";
import TimerDisplayPage from "./pages/TimerDisplayPage.jsx";
import RankingPage from "./pages/RankingPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/tournament/:id" element={<TournamentPage />} />
            </Route>
            <Route path="/tournament/:id/timer" element={<TimerDisplayPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
