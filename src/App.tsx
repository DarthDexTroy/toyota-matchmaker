import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Favorites } from "./pages/Favorites";
import { Passes } from "./pages/Passes";
import NotFound from "./pages/NotFound";
import { mockVehicles } from "./data/mockVehicles";
import { SwipeSession, UserPreferences, Vehicle } from "./types/vehicle";
import { calculateMatchScore } from "./utils/matchScoring";

const queryClient = new QueryClient();

const App = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [session, setSession] = useState<SwipeSession>({
    favorites: [],
    passes: [],
    weights: {},
  });
  const [rankedVehicles, setRankedVehicles] = useState<Vehicle[]>([]);

  // Recalculate match scores when preferences change
  useEffect(() => {
    if (preferences) {
      const scored = mockVehicles.map((v) => ({
        ...v,
        match_score: calculateMatchScore(v, preferences),
      }));
      scored.sort((a, b) => b.match_score - a.match_score);
      setRankedVehicles(scored);
    }
  }, [preferences]);

  const favoriteVehicles = rankedVehicles.filter((v) =>
    session.favorites.includes(v.id)
  );
  const passedVehicles = rankedVehicles.filter((v) =>
    session.passes.includes(v.id)
  );

  const handleRemoveFavorite = (id: string) => {
    setSession((prev) => ({
      ...prev,
      favorites: prev.favorites.filter((fid) => fid !== id),
    }));
  };

  const handleRestorePass = (id: string) => {
    setSession((prev) => ({
      ...prev,
      passes: prev.passes.filter((pid) => pid !== id),
    }));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  preferences={preferences}
                  setPreferences={setPreferences}
                  session={session}
                  setSession={setSession}
                  rankedVehicles={rankedVehicles}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <Favorites
                  vehicles={favoriteVehicles}
                  onRemove={handleRemoveFavorite}
                />
              }
            />
            <Route
              path="/passes"
              element={
                <Passes
                  vehicles={passedVehicles}
                  onRestore={handleRestorePass}
                />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
