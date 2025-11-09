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
      
      <AppHeader title="My Favorites" />

      <main className="container mx-auto px-4 py-8">
        <header className="relative mx-auto max-w-5xl mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")} 
            className="gap-2 text-white/70 hover:text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Swiping
          </Button>
          
          <div className="inline-block rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-md ring-1 ring-white/10">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              My Favorites
            </span>
          </div>

          <h1 className="mt-4 text-balance text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.04] tracking-tight">
            <span className="bg-gradient-to-b from-white via-white to-[#d9d9d9] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,.35)]">
              Your Saved Vehicles
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/70">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} saved • Compare and view details
          </p>
        </header>

        {vehicles.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="rounded-2xl bg-card border border-border backdrop-blur-sm p-12 text-center">
              <h2 className="mb-2 text-2xl font-bold text-card-foreground">
                No favorites yet
              </h2>
              <p className="text-muted-foreground mb-6">
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
