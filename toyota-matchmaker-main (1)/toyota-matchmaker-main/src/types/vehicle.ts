export interface Vehicle {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  image_url: string;
  mpg_or_range: string;
  powertrain: "gas" | "hybrid" | "plug-in-hybrid" | "ev";
  drivetrain: "FWD" | "AWD" | "RWD" | "4WD";
  ext_color: string;
  int_color: string;
  key_features: string[];
  dealer?: {
    name: string;
    city: string;
    state: string;
    distance_miles: number;
  };
  match_score: number;
  body_style: string;
  model: string;
  trim: string;
}

export interface UserPreferences {
  zip: string | null;
  body_style: string | null;
  model: string | null;
  trim: string | null;
  powertrain: string | null;
  drivetrain: string | null;
  color_ext: string | null;
  color_int: string | null;
  features_must: string[];
  features_nice: string[];
  payment_type: "purchase" | "finance" | "lease";
  budget_total: { min: number | null; max: number | null };
  budget_monthly: { target: number | null; type: string | null };
  down_payment: number | null;
  term_months: number | null;
  apr: number | null;
  radius_miles: number | null;
}

export interface SwipeSession {
  favorites: string[];
  passes: string[];
  weights: Record<string, Record<string, number>>;
}
