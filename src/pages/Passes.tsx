import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";
import { VehicleCard } from "@/components/VehicleCard";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";

interface PassesProps {
  vehicles: Vehicle[];
  onRestore: (id: string) => void;
}

export const Passes = ({ vehicles, onRestore }: PassesProps) => {
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
      
      <AppHeader title="Passed Vehicles" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")} 
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Swiping
          </Button>
          <h1 className="mt-4 mb-2 text-4xl font-black leading-tight tracking-tight">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-lg">
              Passed Vehicles
            </span>
          </h1>
          <p className="text-muted-foreground">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} passed
          </p>
        </div>

        {vehicles.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="rounded-2xl bg-card border border-border backdrop-blur-sm p-12 text-center">
              <h2 className="mb-2 text-2xl font-bold text-card-foreground">
                No passes yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Vehicles you pass will appear here
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
                    variant="secondary"
                    size="sm"
                    className="shadow-lg"
                    onClick={() => onRestore(vehicle.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
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

export default Passes;
