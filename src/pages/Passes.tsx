import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";
import { VehicleCard } from "@/components/VehicleCard";
import { ArrowLeft, RotateCcw, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PassesProps {
  vehicles: Vehicle[];
  onRestore: (id: string) => void;
}

export const Passes = ({ vehicles, onRestore }: PassesProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <header className="border-b border-border bg-gradient-to-r from-primary via-primary/90 to-accent backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 items-center justify-center rounded-lg bg-primary-foreground/20 px-3 border-2 border-primary-foreground/40">
              <span className="text-lg font-black text-primary-foreground tracking-wider">TOYOTA</span>
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">Passed Vehicles</h1>
          </div>
          <div className="text-sm text-primary-foreground/80">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {vehicles.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-card-foreground">
                No passes yet
              </h2>
              <p className="text-muted-foreground">
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
              <div key={vehicle.id} className="relative">
                <div className="relative h-[500px]">
                  <VehicleCard vehicle={vehicle} />
                </div>
                <div className="absolute -top-2 -right-2 z-10 flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-10 w-10 rounded-full p-0 shadow-lg bg-accent hover:bg-accent/90"
                    onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-10 w-10 rounded-full p-0 shadow-lg"
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
