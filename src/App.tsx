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
import { toast } from "@/hooks/use-toast";

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
  const [isRescoring, setIsRescoring] = useState(false);

  // AI-based scoring with swipe learning - batch processing
  useEffect(() => {
    if (!preferences) return;

    const rescoreWithAI = async () => {
      setIsRescoring(true);
      
      try {
        const BATCH_SIZE = 6;
        const BATCH_DELAY = 2000; // 2 seconds between batches
        const scoredVehicles: Vehicle[] = [];
        
        // Process vehicles in batches
        for (let i = 0; i < mockVehicles.length; i += BATCH_SIZE) {
          const batch = mockVehicles.slice(i, i + BATCH_SIZE);
          
          const batchResults = await Promise.all(
            batch.map(async (vehicle) => {
              try {
                const { data, error } = await supabase.functions.invoke('ai-match-scorer', {
                  body: {
                    vehicle,
                    preferences,
                    swipeHistory: {
                      favorites: session.favorites,
                      passes: session.passes
                    },
                    allVehicles: mockVehicles
                  }
                });

                if (error) {
                  console.error(`Error scoring vehicle ${vehicle.id}:`, error);
                  return { ...vehicle, match_score: calculateMatchScore(vehicle, preferences) };
                }

                return { ...vehicle, match_score: data.match_score };
              } catch (err) {
                console.error(`Failed to score vehicle ${vehicle.id}:`, err);
                return { ...vehicle, match_score: calculateMatchScore(vehicle, preferences) };
              }
            })
          );
          
          scoredVehicles.push(...batchResults);
          
          // Add delay between batches (except for the last batch)
          if (i + BATCH_SIZE < mockVehicles.length) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
          }
        }

        scoredVehicles.sort((a, b) => b.match_score - a.match_score);
        setRankedVehicles(scoredVehicles);
        
        // Show learning toast after a few swipes
        if (session.favorites.length + session.passes.length > 2) {
          toast({
            title: "AI Adapted to Your Preferences",
            description: "Match scores updated based on your swipes.",
          });
        }
      } catch (error) {
        console.error('Error rescoring vehicles:', error);
        toast({
          title: "Using Basic Scoring",
          description: "AI scoring unavailable, using fallback algorithm.",
          variant: "destructive",
        });
        
        const fallbackScored = mockVehicles.map((v) => ({
          ...v,
          match_score: calculateMatchScore(v, preferences),
        }));
        fallbackScored.sort((a, b) => b.match_score - a.match_score);
        setRankedVehicles(fallbackScored);
      } finally {
        setIsRescoring(false);
      }
    };

    rescoreWithAI();
  }, [preferences, session.favorites, session.passes]);

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
                  isRescoring={isRescoring}
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
