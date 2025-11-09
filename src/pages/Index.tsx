import { useState, useEffect } from "react";
import { SwipeDeck } from "@/components/SwipeDeck";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3 } from "lucide-react";
import { SwipeSession, UserPreferences, Vehicle } from "@/types/vehicle";
import { PreferencesModal } from "@/components/PreferencesModal";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";

interface IndexProps {
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => void;
  session: SwipeSession;
  setSession: (session: SwipeSession | ((prev: SwipeSession) => SwipeSession)) => void;
  rankedVehicles: Vehicle[];
}

const Index = ({ preferences, setPreferences, session, setSession, rankedVehicles }: IndexProps) => {
  const navigate = useNavigate();
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; direction: "left" | "right" }>>([]);

  // Show preferences modal on first load
  useEffect(() => {
    if (!preferences) {
      setShowPrefsModal(true);
    }
  }, [preferences]);

  const handlePreferencesComplete = (prefs: UserPreferences) => {
    setPreferences(prefs);
    setShowPrefsModal(false);
    // Reset session when preferences change
    setSession({
      favorites: [],
      passes: [],
      weights: {},
    });
    setHistory([]);
  };

  const handleEditPreferences = () => {
    setShowPrefsModal(true);
  };

  const handleSwipe = (vehicleId: string, direction: "left" | "right") => {
    setHistory([...history, { id: vehicleId, direction }]);

    setSession((prev) => ({
      ...prev,
      favorites:
        direction === "right" ? [...prev.favorites, vehicleId] : prev.favorites,
      passes:
        direction === "left" ? [...prev.passes, vehicleId] : prev.passes,
    }));
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    setHistory(history.slice(0, -1));

    setSession((prev) => ({
      ...prev,
      favorites: prev.favorites.filter((id) => id !== lastAction.id),
      passes: prev.passes.filter((id) => id !== lastAction.id),
    }));
  };

  const remainingVehicles = rankedVehicles.filter(
    (v) => !session.favorites.includes(v.id) && !session.passes.includes(v.id)
  );

  const allReviewed = remainingVehicles.length === 0 && (session.favorites.length > 0 || session.passes.length > 0);

  // Navigate to favorites when all vehicles reviewed
  useEffect(() => {
    if (allReviewed && preferences) {
      navigate("/favorites");
    }
  }, [allReviewed, navigate, preferences]);

  if (!preferences) {
    return (
      <PreferencesModal
        open={showPrefsModal}
        onComplete={handlePreferencesComplete}
      />
    );
  }

  return (
    <>
      <PreferencesModal
        open={showPrefsModal}
        onComplete={handlePreferencesComplete}
        initialPrefs={preferences}
      />
      
      <div className="min-h-screen relative overflow-hidden">
        {/* Gentle spotlight from bottom */}
        <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(800px_400px_at_50%_120%,rgba(255,255,255,.07),transparent_70%)]" />
        
        {/* Grain texture */}
        <div 
          className="pointer-events-none absolute inset-0 -z-20 opacity-20"
          style={{ 
            backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'140\' viewBox=\'0 0 140 140\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/><feColorMatrix type=\'saturate\' values=\'0\'/><feComponentTransfer><feFuncA type=\'table\' tableValues=\'0 0 0 .05 .12\'/></feComponentTransfer></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")'
          }} 
        />
        
        <AppHeader onSettingsClick={handleEditPreferences} />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <header className="relative mx-auto max-w-5xl mb-8">
            <div className="inline-block rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-md ring-1 ring-white/10">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                YotaMatch
              </span>
            </div>

            <h1 className="mt-4 text-balance text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.04] tracking-tight">
              <span className="bg-gradient-to-b from-white via-white to-[#d9d9d9] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,.35)]">
                Find Your Perfect Toyota
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/70">
              Swipe to like, save favorites, and compare financing or lease options.
            </p>
          </header>

          <div className="flex justify-center">
            <SwipeDeck
              vehicles={remainingVehicles}
              onSwipe={handleSwipe}
              onUndo={handleUndo}
              canUndo={history.length > 0}
            />
          </div>

          {/* Stats */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/3 ring-1 ring-white/15 backdrop-blur-sm p-6 text-center">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-[#EB0A1E]" />
              <div className="text-2xl font-bold text-white">
                {session.passes.length}
              </div>
              <div className="text-sm text-white/70">Reviewed</div>
            </div>
            <div className="rounded-2xl bg-white/3 ring-1 ring-white/15 backdrop-blur-sm p-6 text-center">
              <Heart className="mx-auto mb-2 h-8 w-8 text-[#EB0A1E]" />
              <div className="text-2xl font-bold text-white">
                {session.favorites.length}
              </div>
              <div className="text-sm text-white/70">Favorites</div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
