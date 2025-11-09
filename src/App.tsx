import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Index from "./pages/Index";
import { Favorites } from "./pages/Favorites";
import { Passes } from "./pages/Passes";
import { VehicleDetail } from "./pages/VehicleDetail";
import NotFound from "./pages/NotFound";
import { mockVehicles } from "./data/mockVehicles";
import { SwipeSession, UserPreferences, Vehicle } from "./types/vehicle";
import { calculateMatchScore } from "./utils/matchScoring";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

// Wrapper component to handle vehicle detail route
const VehicleDetailWrapper = ({ rankedVehicles }: { rankedVehicles: Vehicle[] }) => {
  const { id } = useParams();
  const vehicle = rankedVehicles.find((v) => v.id === id) || rankedVehicles[0];
  return <VehicleDetail vehicle={vehicle} />;
};

const App = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [session, setSession] = useState<SwipeSession>({
    favorites: [],
    passes: [],
    weights: {},
  });
  const [rankedVehicles, setRankedVehicles] = useState<Vehicle[]>([]);

  // Recalculate match scores when preferences change using AI
  useEffect(() => {
    const scoreVehicles = async () => {
      if (!preferences) return;
      
      const scoredVehicles = await Promise.all(
        mockVehicles.map(async (vehicle) => {
          try {
            const { data, error } = await supabase.functions.invoke('match-scorer', {
              body: { vehicle, preferences }
            });
            
            if (error) {
              console.error('Error scoring vehicle:', vehicle.title, error);
              // Fallback to algorithm if AI fails
              return {
                ...vehicle,
                match_score: calculateMatchScore(vehicle, preferences),
              };
            }
            
            return {
              ...vehicle,
              match_score: data.score,
            };
          } catch (err) {
            console.error('Error scoring vehicle:', vehicle.title, err);
            // Fallback to algorithm if AI fails
            return {
              ...vehicle,
              match_score: calculateMatchScore(vehicle, preferences),
            };
          }
        })
      );
      
      scoredVehicles.sort((a, b) => b.match_score - a.match_score);
      setRankedVehicles(scoredVehicles);
    };
    
    scoreVehicles();
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
            <Route
              path="/vehicle/:id"
              element={<VehicleDetailWrapper rankedVehicles={rankedVehicles} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
