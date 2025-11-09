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

  // Hybrid AI scoring: basic algorithm first, then AI refines top matches
  useEffect(() => {
    if (!preferences) return;

    const rescoreWithAI = async () => {
      setIsRescoring(true);
      
      try {
        // Step 1: Use basic algorithm to pre-score all vehicles
        const basicScored = mockVehicles.map((v) => ({
          ...v,
          match_score: calculateMatchScore(v, preferences),
        }));
        
        // Sort by basic score and take top 15 for AI refinement
        basicScored.sort((a, b) => b.match_score - a.match_score);
        const topVehicles = basicScored.slice(0, 15);
        const remainingVehicles = basicScored.slice(15);
        
        // Step 2: Send top vehicles to AI one at a time with delays
        const aiScoredVehicles: Vehicle[] = [];
        const DELAY_MS = 6500; // 6.5 seconds between requests (under 10/min limit)
        
        for (let i = 0; i < topVehicles.length; i++) {
          const vehicle = topVehicles[i];
          
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
              aiScoredVehicles.push(vehicle); // Keep basic score
            } else {
              aiScoredVehicles.push({ ...vehicle, match_score: data.match_score });
            }
          } catch (err) {
            console.error(`Failed to score vehicle ${vehicle.id}:`, err);
            aiScoredVehicles.push(vehicle); // Keep basic score
          }
          
          // Add delay between requests (except for last one)
          if (i < topVehicles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
          }
        }
        
        // Step 3: Combine AI-scored top vehicles with basic-scored remaining ones
        const allScored = [...aiScoredVehicles, ...remainingVehicles];
        allScored.sort((a, b) => b.match_score - a.match_score);
        setRankedVehicles(allScored);
        
        // Show learning toast after a few swipes
        if (session.favorites.length + session.passes.length > 2) {
          toast({
            title: "AI Refined Top Matches",
            description: "Top 15 vehicles scored with AI based on your preferences.",
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
