import { Vehicle, UserPreferences } from "@/types/vehicle";

export const calculateMatchScore = (
  vehicle: Vehicle,
  prefs: UserPreferences
): number => {
  let score = 0;

  // 1. Body Style Match (20 points)
  if (prefs.body_style) {
    if (vehicle.body_style === prefs.body_style) {
      score += 20;
    }
  } else {
    score += 20; // No preference = full points
  }

  // 2. Price Range Match (25 points)
  const { min, max } = prefs.budget_total;
  if (max && vehicle.price > max) {
    const over = vehicle.price - max;
    const band = 0.15 * max;
    score += Math.max(0, 25 * (1 - over / band));
  } else if (min && vehicle.price < min * 0.8) {
    score += 15; // Below budget - might be missing features
  } else {
    score += 25; // Within budget
  }

  // 3. Powertrain Match (20 points)
  if (prefs.powertrain) {
    if (vehicle.powertrain === prefs.powertrain) {
      score += 20;
    }
  } else {
    score += 20;
  }

  // 4. Drivetrain Match (10 points)
  if (prefs.drivetrain) {
    if (vehicle.drivetrain === prefs.drivetrain) {
      score += 10;
    }
  } else {
    score += 10;
  }

  // 5. Exterior Color Match (15 points)
  if (prefs.color_ext) {
    const prefColor = prefs.color_ext.toLowerCase();
    const vehColor = vehicle.ext_color.toLowerCase();
    if (vehColor.includes(prefColor) || prefColor.includes(vehColor)) {
      score += 15;
    } else if (isSimilarColor(prefColor, vehColor)) {
      score += 8; // Partial match for similar colors
    }
  } else {
    score += 15;
  }

  // 6. Model Match (10 points bonus)
  if (prefs.model && vehicle.model === prefs.model) {
    score += 10;
  }

  // Ensure score is between 0-100
  return Math.min(100, Math.max(0, Math.round(score)));
};

const isSimilarColor = (color1: string, color2: string): boolean => {
  const colorFamilies = [
    ["red", "ruby", "crimson", "scarlet"],
    ["blue", "navy", "azure", "cobalt"],
    ["black", "midnight", "onyx"],
    ["white", "pearl", "frost"],
    ["silver", "gray", "grey", "metallic"],
    ["green", "forest", "emerald"],
  ];

  for (const family of colorFamilies) {
    const in1 = family.some((c) => color1.includes(c));
    const in2 = family.some((c) => color2.includes(c));
    if (in1 && in2) return true;
  }

  return false;
};
