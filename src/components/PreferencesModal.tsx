import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { UserPreferences } from "@/types/vehicle";
import { Slider } from "./ui/slider";

interface PreferencesModalProps {
  open: boolean;
  onComplete: (prefs: UserPreferences) => void;
  initialPrefs?: UserPreferences | null;
}

export const PreferencesModal = ({ open, onComplete, initialPrefs }: PreferencesModalProps) => {
  const [prefs, setPrefs] = useState<UserPreferences>(
    initialPrefs || {
      zip: null,
      body_style: null,
      model: null,
      trim: null,
      powertrain: null,
      drivetrain: null,
      color_ext: null,
      color_int: null,
      features_must: [],
      features_nice: [],
      payment_type: "purchase",
      budget_total: { min: 20000, max: 50000 },
      budget_monthly: { target: null, type: null },
      down_payment: null,
      term_months: 60,
      apr: 0.049,
      radius_miles: 50,
    }
  );

  const handleSubmit = () => {
    onComplete(prefs);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Find Your Perfect Toyota</DialogTitle>
          <DialogDescription>
            Tell us your preferences to get personalized match scores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Body Style */}
          <div className="space-y-2">
            <Label htmlFor="body_style">Preferred Body Style</Label>
            <Select
              value={prefs.body_style || "any"}
              onValueChange={(value) =>
                setPrefs({ ...prefs, body_style: value === "any" ? null : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any body style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="hatchback">Hatchback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Powertrain */}
          <div className="space-y-2">
            <Label htmlFor="powertrain">Powertrain Preference</Label>
            <Select
              value={prefs.powertrain || "any"}
              onValueChange={(value) =>
                setPrefs({ ...prefs, powertrain: value === "any" ? null : value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any powertrain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="gas">Gas</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="plug-in-hybrid">Plug-in Hybrid</SelectItem>
                <SelectItem value="ev">Electric (EV)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exterior Color */}
          <div className="space-y-2">
            <Label htmlFor="color_ext">Preferred Exterior Color</Label>
            <Input
              id="color_ext"
              placeholder="e.g., Red, Blue, Silver"
              value={prefs.color_ext || ""}
              onChange={(e) => setPrefs({ ...prefs, color_ext: e.target.value })}
            />
          </div>

          {/* Payment Type */}
          <div className="space-y-2">
            <Label htmlFor="payment_type">How do you plan to pay? *</Label>
            <Select
              value={prefs.payment_type}
              onValueChange={(value) =>
                setPrefs({ ...prefs, payment_type: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase (Cash)</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="lease">Lease</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range */}
          <div className="space-y-3">
            <Label>Budget Range *</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">Min:</span>
                <span className="text-lg font-semibold">
                  ${prefs.budget_total.min?.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[prefs.budget_total.min || 20000]}
                onValueChange={([min]) =>
                  setPrefs({
                    ...prefs,
                    budget_total: { ...prefs.budget_total, min },
                  })
                }
                min={15000}
                max={80000}
                step={1000}
              />
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">Max:</span>
                <span className="text-lg font-semibold">
                  ${prefs.budget_total.max?.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[prefs.budget_total.max || 50000]}
                onValueChange={([max]) =>
                  setPrefs({
                    ...prefs,
                    budget_total: { ...prefs.budget_total, max },
                  })
                }
                min={15000}
                max={80000}
                step={1000}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={handleSubmit} size="lg" className="px-8">
            {initialPrefs ? "Update Preferences" : "Start Matching"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
