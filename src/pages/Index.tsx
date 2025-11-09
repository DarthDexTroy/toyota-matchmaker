import { useState, useEffect } from "react";
import { SwipeDeck } from "@/components/SwipeDeck";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3, Settings, X } from "lucide-react";
import { SwipeSession, UserPreferences, Vehicle } from "@/types/vehicle";
import { PreferencesModal } from "@/components/PreferencesModal";
import { useNavigate } from "react-router-dom";

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
      
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        {/* Header */}
        <header className="border-b border-border bg-gradient-to-r from-primary via-primary/90 to-accent backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 items-center justify-center rounded-lg bg-primary-foreground/20 px-3 border-2 border-primary-foreground/40">
                <span className="text-lg font-black text-primary-foreground tracking-wider">TOYOTA</span>
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                MatchMyToyota
              </h1>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate("/passes")}
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
              >
                <X className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate("/favorites")}
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleEditPreferences}
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              Find Your Perfect Toyota
            </h2>
            <p className="text-muted-foreground">
              Swipe right to save, left to pass. We'll learn your preferences!
            </p>
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
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-4">
            <div className="rounded-2xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-primary" />
              <div className="text-2xl font-bold text-card-foreground">
                {rankedVehicles.length - remainingVehicles.length}
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
            <div className="rounded-2xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
              <div className="mx-auto mb-2 text-2xl">🎯</div>
              <div className="text-2xl font-bold text-card-foreground">
                {remainingVehicles.length}
              </div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
