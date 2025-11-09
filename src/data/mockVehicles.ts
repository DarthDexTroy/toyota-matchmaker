import { Vehicle } from "@/types/vehicle";
import inventoryData from "./toyota_inventory_2025_2026.json";

// Generate mock vehicles from Toyota inventory JSON
const generateVehiclesFromInventory = (): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  
  inventoryData.forEach((item, index) => {
    const trims = item.trims.split(";").map((t) => t.trim());
    const selectedTrim = trims[Math.floor(Math.random() * trims.length)];
    
    // Map powertrain from JSON to our types
    let powertrain: "gas" | "hybrid" | "plug-in-hybrid" | "ev" = "gas";
    if (item.powertrain.toLowerCase().includes("phev") || item.powertrain.toLowerCase().includes("plug-in")) {
      powertrain = "plug-in-hybrid";
    } else if (item.powertrain.toLowerCase().includes("bev") || item.powertrain.toLowerCase().includes("electric")) {
      powertrain = "ev";
    } else if (item.powertrain.toLowerCase().includes("hybrid")) {
      powertrain = "hybrid";
    }
    
    // Sample colors (these would ideally come from the color_info URL)
    const exteriorColors = ["Blueprint", "Wind Chill Pearl", "Supersonic Red", "Midnight Black Metallic", "Lunar Rock", "Predawn Gray", "Celestial Silver"];
    const interiorColors = ["Black Fabric", "Black SofTex", "Black Leather", "Ash Fabric", "Glazed Caramel Leather"];
    
    // Sample features based on body style and model
    const getFeatures = (model: string, bodyStyle: string) => {
      const baseFeatures = ["Toyota Safety Sense", "8-inch Touchscreen", "Apple CarPlay & Android Auto"];
      const hybridFeatures = powertrain.includes("hybrid") ? ["Hybrid Synergy Drive", "Regenerative Braking"] : [];
      const luxuryFeatures = selectedTrim.toLowerCase().includes("limited") || selectedTrim.toLowerCase().includes("platinum") 
        ? ["Premium Audio System", "Leather Seats", "Heated & Ventilated Seats"]
        : [];
      const suvFeatures = bodyStyle.toLowerCase() === "suv" ? ["All-Terrain Capability", "Power Liftgate"] : [];
      
      return [...baseFeatures, ...hybridFeatures, ...luxuryFeatures, ...suvFeatures].slice(0, 5);
    };
    
    // Sample images by body style
    const getImageForBodyStyle = (bodyStyle: string) => {
      const images: Record<string, string> = {
        "sedan": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop",
        "suv": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
        "truck": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop",
        "hatchback": "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&h=600&fit=crop",
        "minivan": "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&h=600&fit=crop",
        "coupe": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
        "crossover": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
      };
      return images[bodyStyle.toLowerCase()] || images["sedan"];
    };
    
    // MPG/Range based on powertrain
    const getMpgRange = (powertrain: string) => {
      if (powertrain === "ev") return "250 Miles Range";
      if (powertrain === "plug-in-hybrid") return "40 Miles EV + 45 MPG";
      if (powertrain === "hybrid") return "45 MPG Combined";
      return "28 MPG Combined";
    };
    
    // Sample drivetrains
    const drivetrains: Array<"FWD" | "AWD" | "RWD" | "4WD"> = ["FWD", "AWD", "RWD", "4WD"];
    const drivetrain = item.body_style.toLowerCase() === "truck" || item.body_style.toLowerCase() === "suv" 
      ? (Math.random() > 0.5 ? "AWD" : "4WD") 
      : (Math.random() > 0.5 ? "FWD" : "AWD");
    
    if (!item.base_msrp_usd) return; // Skip if no price
    
    vehicles.push({
      id: `${item.model_year}-${item.model.replace(/\s+/g, "-")}-${index}`,
      title: `${item.model_year} ${item.model}`,
      subtitle: selectedTrim,
      price: item.base_msrp_usd,
      image_url: getImageForBodyStyle(item.body_style),
      mpg_or_range: getMpgRange(powertrain),
      powertrain,
      drivetrain,
      ext_color: exteriorColors[Math.floor(Math.random() * exteriorColors.length)],
      int_color: interiorColors[Math.floor(Math.random() * interiorColors.length)],
      key_features: getFeatures(item.model, item.body_style),
      match_score: 85, // Default, will be recalculated
      body_style: item.body_style.toLowerCase(),
      model: item.model,
      trim: selectedTrim,
    });
  });
  
  return vehicles;
};

export const mockVehicles: Vehicle[] = generateVehiclesFromInventory().filter(v => v);
