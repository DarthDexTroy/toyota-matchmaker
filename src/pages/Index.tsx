import { useState } from "react";
import { SwipeDeck } from "@/components/SwipeDeck";
import { mockVehicles } from "@/data/mockVehicles";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3, Settings } from "lucide-react";
import { SwipeSession } from "@/types/vehicle";

const Index = () => {
  const [session, setSession] = useState<SwipeSession>({
    favorites: [],
    passes: [],
    weights: {},
  });

  const [history, setHistory] = useState<Array<{ id: string; direction: "left" | "right" }>>([]);

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

  const remainingVehicles = mockVehicles.filter(
    (v) => !session.favorites.includes(v.id) && !session.passes.includes(v.id)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">T</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Toyota Match
            </h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Heart className="h-5 w-5" />
              <span className="hidden sm:inline">
                Favorites ({session.favorites.length})
              </span>
              <span className="sm:hidden">{session.favorites.length}</span>
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
              {mockVehicles.length - remainingVehicles.length}
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
  );
};

export default Index;
