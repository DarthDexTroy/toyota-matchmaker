import { Vehicle } from "@/types/vehicle";
import { CircularMatchScore } from "./CircularMatchScore";
import { Gauge, Droplet } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  style?: React.CSSProperties;
}

export const VehicleCard = ({ vehicle, style }: VehicleCardProps) => {
  return (
    <article
      className="absolute h-full w-full select-none overflow-hidden rounded-3xl bg-white/3 ring-1 ring-white/15 backdrop-blur-sm pointer-events-none"
      style={style}
    >
      {/* Image Section */}
      <div className="relative h-3/5 w-full overflow-hidden bg-black/20">
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
      <div className="relative h-2/5 overflow-y-auto bg-gradient-to-b from-black/40 to-black/60 backdrop-blur-md p-6 flex flex-col pointer-events-auto">
        <div className="mb-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {vehicle.title}
          </h2>
          <p className="text-lg text-white/70">{vehicle.subtitle}</p>
        </div>

        <div className="mb-4">
          <div className="text-3xl font-bold bg-gradient-to-r from-[#EB0A1E] to-[#A50000] bg-clip-text text-transparent">
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
          <h3 className="mb-2 text-sm font-semibold text-white">
            Key Features
          </h3>
          <div className="flex flex-wrap gap-2">
            {vehicle.key_features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-white/5 ring-1 ring-white/10 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/90"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 text-xs text-white/60 border-t border-white/10">
          <span>
            {vehicle.ext_color} • {vehicle.int_color}
          </span>
          <span>{vehicle.drivetrain}</span>
        </div>
      </div>
    </article>
  );
};
