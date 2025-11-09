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
    
    // Sample images by body style (fallback)
    const imagesByBodyStyle: Record<string, string> = {
      "sedan": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop",
      "suv": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
      "truck": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop",
      "hatchback": "https://images.unsplash.com/photo-1551952237-954a0e68786c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740",
      "minivan": "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&h=600&fit=crop",
      "coupe": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
      "crossover": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
    };

    // Map specific models to distinct images (one entry per model in your inventory)
    const imagesByModel: Record<string, string> = {
      "camry": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740",
      "corolla": "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1708",
      "corollahybrid": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/corolla/mlp/welcome-mat/COR_MY23_0019_V001_desktop.png?fmt=jpeg&fit=crop&wid=2878",
      "prius": "https://images.unsplash.com/photo-1551952237-954a0e68786c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740",
      "priuspluginhybrid": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/prius/mlp/welcome/PRS_MY25_0002_V001.png?fmt=jpeg&fit=crop&wid=2878",
      "crown": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/toyotacrown/galleries/CRW_MY23_0012_V001.png:tcom_gallery_16x9",
      "crownsignia": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2025/crownsignia/gallery/CRS_MY25_0011_V001_desktop.png?fmt=jpeg&fit=crop&qlt=90&wid=2048",
      "sienna": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/sienna/galleries/SIE_MY26_0001_V002.png:tcom_gallery_1x1?ts=1762363543460&fmt=jpg&fit=crop&dpr=on,2&wid=591&hei=591",
      "corollacross": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/corollacross/galleries/CCH_MY26_0006_V001.png:tcom_gallery_4x3?ts=1762366014517&fmt=jpg&fit=crop&dpr=on,2",
      "corollacrosshybrid": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/corollacross/galleries/CCH_MY26_0010_V001.png:tcom_gallery_16x9",
      "rav4": "https://images.unsplash.com/photo-1706509234538-9831b1b33d66?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1742",
      "rav4hybrid": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2025/rav4/gallery/thumbs/RHV_MY25_0007_V001_thumb.png?wid=760&hei=760&fmt=jpg&fit=crop",
      "rav4pluginhybrid": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2025/rav4/mlp/short-gallery/RAV_MY25_0003_V001_desktop.png?fmt=jpeg&fit=crop&qlt=90&wid=1024",
      "bz4x": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/bz/galleries/BZE_MY26_0018_V001.png:tcom_gallery_4x3?ts=1762366504805&fmt=jpg&fit=crop&dpr=on,2",
      "highlander": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/highlander/galleries/HLD_MY23_0018_V002.png:tcom_gallery_1x1?ts=1762366640153&fmt=jpg&fit=crop&dpr=on,2",
      "grandhighlander": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/grandhighlander/galleries/GHM_MY24_0057_V001.png:tcom_gallery_16x9?ts=1762366683191&fmt=jpg&fit=crop&dpr=on,2",
      "4runner": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/4runner/galleries/FRN_MY25_0034_V001.png:tcom_gallery_16x9",
      "landcruiser": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/landcruiser/galleries/LND_MY24_0019_V001.png:tcom_gallery_4x3?ts=1762374417217&fmt=jpg&fit=crop&dpr=on,2",
      "sequoia": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/sequoia/galleries/SEQ_MY26_0010_V001.png:tcom_gallery_4x3?ts=1762363811040&fmt=jpg&fit=crop&dpr=on,2",
      "tacoma": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2025/tacoma/gallery/TAH_MY25_0004_V001.png?wid=2000&fmt=jpg&fit=crop",
      "tundra": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/tundra/galleries/TUN_MY25_0001_V001.png:tcom_gallery_4x3?ts=1762696828816&fmt=jpg&fit=crop&dpr=on,2",
      "tundraiforcemax": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/tundra/galleries/TUN_MY22_0004_V003.png:tcom_gallery_16x9",
      "grcorolla": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/grcorolla/galleries/GRC_MY25_0016_V001.png:tcom_gallery_16x9?ts=1762367250199&fmt=jpg&fit=crop&dpr=on,2",
      "grsupra": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/grsupra2/galleries/SUP_MY24_0045_V001.png:tcom_gallery_16x9?ts=1762366290748&fmt=jpg&fit=crop&dpr=on,2",
      "gr86": "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2026/gr86/galleries/G86_MY26_0003_V001.png:tcom_gallery_4x3?ts=1762366935578&fmt=jpg&fit=crop&dpr=on,2"
    };

    // Get image by model first, then fall back to body style
    const getImageForModel = (model: string, bodyStyle: string) => {
      const key = model.trim().toLowerCase();
      const simple = key.replace(/[^a-z0-9]/g, ""); // remove spaces/symbols for matching ("Corolla Cross" -> "corollacross")
      if (imagesByModel[key]) return imagesByModel[key];
      if (imagesByModel[simple]) return imagesByModel[simple];
      return imagesByBodyStyle[bodyStyle.toLowerCase()] || imagesByBodyStyle["sedan"];
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
      image_url: getImageForModel(item.model, item.body_style),
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
