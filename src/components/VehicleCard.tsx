import { Vehicle } from "@/types/vehicle";
import { CircularMatchScore } from "./CircularMatchScore";
import { Gauge, Droplet } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  style?: React.CSSProperties;
}

export const VehicleCard = ({ vehicle, style }: VehicleCardProps) => {
  return (
    <div
      className="absolute h-full w-full select-none overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]"
      style={style}
    >
      {/* Image Section */}
      <div className="relative h-3/5 w-full overflow-hidden bg-muted">
        <img
          src={vehicle.image_url}
          alt={`${vehicle.title} ${vehicle.subtitle}`}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <CircularMatchScore score={vehicle.match_score} size="md" />
        </div>
      </div>

      {/* Content Section */}
      <div className="relative h-2/5 overflow-y-auto bg-card p-6 flex flex-col">
        <div className="mb-3">
          <h2 className="text-2xl font-bold text-card-foreground">
            {vehicle.title}
          </h2>
          <p className="text-lg text-muted-foreground">{vehicle.subtitle}</p>
        </div>

        <div className="mb-4">
          <div className="text-3xl font-bold text-primary">
            ${vehicle.price.toLocaleString()}
          </div>
        </div>

        <div className="mb-4 flex gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-green-500 px-3 py-1.5 text-sm">
            <Gauge className="h-4 w-4 text-white" />
            <span className="font-medium text-white">
              {vehicle.mpg_or_range}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
            vehicle.powertrain.toLowerCase().includes('hybrid') 
              ? 'bg-green-600' 
              : vehicle.powertrain.toLowerCase().includes('electric')
              ? 'bg-yellow-600'
              : 'bg-gray-600'
          }`}>
            <Droplet className="h-4 w-4 text-white" />
            <span className="font-medium capitalize text-white">
              {vehicle.powertrain}
            </span>
          </div>
        </div>

        <div className="mb-3 flex-1">
          <h3 className="mb-2 text-sm font-semibold text-card-foreground">
            Key Features
          </h3>
          <div className="flex flex-wrap gap-2">
            {vehicle.key_features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 border border-primary/30 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground border-t border-border">
          <span>
            {vehicle.ext_color} • {vehicle.int_color}
          </span>
          <span>{vehicle.drivetrain}</span>
        </div>
      </div>
    </div>
  );
};
