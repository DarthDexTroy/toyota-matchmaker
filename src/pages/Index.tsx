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
      
      <div className="min-h-screen bg-gradient-to-br from-muted via-muted/80 to-muted/60">
        <AppHeader onSettingsClick={handleEditPreferences} />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              Find Your Perfect Toyota
            </h2>
          </div>

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
            <div className="rounded-2xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-primary" />
              <div className="text-2xl font-bold text-card-foreground">
                {session.passes.length}
              </div>
              <div className="text-sm text-muted-foreground">Reviewed</div>
            </div>
            <div className="rounded-2xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
              <Heart className="mx-auto mb-2 h-8 w-8 text-match-excellent" />
              <div className="text-2xl font-bold text-card-foreground">
                {session.favorites.length}
              </div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
