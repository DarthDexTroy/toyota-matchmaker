import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";
import { ArrowLeft, Gauge, Droplet, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CircularMatchScore } from "@/components/CircularMatchScore";
import { CostEstimator } from "@/components/CostEstimator";
import { AppHeader } from "@/components/AppHeader";

interface VehicleDetailProps {
  vehicle: Vehicle;
}

export const VehicleDetail = ({ vehicle }: VehicleDetailProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Image & Info */}
          <div className="space-y-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={vehicle.image_url}
                alt={`${vehicle.title} ${vehicle.subtitle}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <CircularMatchScore score={vehicle.match_score} size="lg" />
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border">
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-1">{vehicle.title}</h2>
                  <p className="text-xl text-muted-foreground">{vehicle.subtitle}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">${vehicle.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">MSRP</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                      <Gauge className="h-4 w-4" />
                      <span className="text-xs font-medium text-muted-foreground uppercase">Efficiency</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{vehicle.mpg_or_range}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                      <Droplet className="h-4 w-4" />
                      <span className="text-xs font-medium text-muted-foreground uppercase">Powertrain</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground capitalize">{vehicle.powertrain}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Drivetrain</span>
                    <p className="text-sm font-semibold text-foreground">{vehicle.drivetrain}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Body Style</span>
                    <p className="text-sm font-semibold text-foreground capitalize">{vehicle.body_style}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Colors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-3 border border-primary/20">
                      <span className="text-xs text-muted-foreground">Exterior</span>
                      <p className="text-sm font-semibold text-foreground mt-1">{vehicle.ext_color}</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-3 border border-primary/20">
                      <span className="text-xs text-muted-foreground">Interior</span>
                      <p className="text-sm font-semibold text-foreground mt-1">{vehicle.int_color}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <BadgeCheck className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Key Features</h3>
              </div>
              <div className="grid gap-2">
                {vehicle.key_features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-2 border-primary"
                  >
                    <div className="mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm text-foreground flex-1">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Cost Estimator */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border">
              <CostEstimator vehicle={vehicle} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VehicleDetail;
