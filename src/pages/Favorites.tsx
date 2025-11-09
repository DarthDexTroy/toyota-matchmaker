import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";
import { VehicleCard } from "@/components/VehicleCard";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";

interface FavoritesProps {
  vehicles: Vehicle[];
  onRemove: (id: string) => void;
}

export const Favorites = ({ vehicles, onRemove }: FavoritesProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-muted/80 to-muted/60">
      <AppHeader title="My Favorites" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Swiping
          </Button>
          <h1 className="text-3xl font-bold text-foreground mt-4 mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} saved
          </p>
        </div>

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
              <div key={vehicle.id} className="relative group">
                <div className="relative h-[500px] rounded-3xl overflow-hidden">
                  <VehicleCard vehicle={vehicle} />
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex gap-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 shadow-lg bg-accent hover:bg-accent/90"
                    onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="shadow-lg"
                    onClick={() => onRemove(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
