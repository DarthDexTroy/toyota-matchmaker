import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";
import { VehicleCard } from "@/components/VehicleCard";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FavoritesProps {
  vehicles: Vehicle[];
  onRemove: (id: string) => void;
}

export const Favorites = ({ vehicles, onRemove }: FavoritesProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {vehicles.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-card-foreground">
                No favorites yet
              </h2>
              <p className="text-muted-foreground">
                Swipe right on vehicles you like to add them here
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Start Swiping
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="relative">
                <div className="relative h-[500px]">
                  <VehicleCard vehicle={vehicle} />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 z-10 h-10 w-10 rounded-full p-0 shadow-lg"
                  onClick={() => onRemove(vehicle.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
