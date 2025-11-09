import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are "Toyota Match Grade". Output ONLY a single integer 0–100 for ONE candidate Toyota vehicle. No words, JSON, punctuation, or newline. Deterministic.

INPUTS PROVIDED: user_profile, swipe_history, candidate_vehicle, all_vehicles.

HARD EXCLUSIONS → output 0:
- Price exceeds budget.max by >20%
- Must-have features not all present
- Body style completely incompatible

FEATURE SIGNALS (x∈[0,1], y=2x−1∈[−1,1]; use x=0.60 when missing):

1) Price fit:
   P = vehicle.price
   target = budget.max || budget.min
   tolerance = 0.15 * target
   ratio = abs(P - target) / tolerance
   x_price = max(0.30, 1 - 0.40*min(ratio, 2.0))

2) Body style:
   If no preference → x=0.60
   If exact match → x=1.00
   Else → x=0.30

3) Powertrain:
   If no preference → x=0.60
   If exact match → x=1.00
   Else → x=0.30

4) Drivetrain:
   If no preference → x=0.60
   If exact match → x=1.00
   Else → x=0.30

5) Exterior color WITH SWIPE LEARNING:
   Base: in preferred list → 1.00; no preference → 0.60; not preferred → 0.45
   Count liked vehicles with same ext_color → like_count
   Count passed vehicles with same ext_color → dislike_count
   If dislike_count ≥ 3 → x = min(base, 0.25)
   If like_count ≥ 3 → x = max(base, 0.85)

6) Interior color WITH SWIPE LEARNING:
   Same logic as exterior color

7) Must-have features:
   x_must = 1.00 (enforced by hard exclusion)

8) Nice-to-have features:
   If no nice-to-have → x=0.60
   Else x = (count_present / total_nice_to_have)

9) Model preference:
   If no preference → x=0.60
   If matches user model → x=1.00
   Else → x=0.50

10) Bias: y_bias = 1.00

FEATURE WEIGHTS (relative importance):
w_bias=0.8, w_price=1.4, w_body_style=1.0, w_powertrain=1.0, w_drivetrain=0.6,
w_color_ext=0.4, w_color_int=0.2, w_must_have=1.6, w_nice_to_have=0.6, w_model=0.8

SCORING FORMULA:
1. Transform each x_i to y_i = 2*x_i - 1
2. S = Σ(w_i * y_i) over all features + w_bias*y_bias
3. p = 1/(1 + exp(-S))  [sigmoid]
4. grade = round(100 * p)
5. Clamp to [0, 100]

OUTPUT RULE: Return ONLY the integer (0–100). Nothing else.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vehicle, preferences, swipeHistory, allVehicles } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze swipe history for color learning
    const likedColors = { ext: new Map<string, number>(), int: new Map<string, number>() };
    const dislikedColors = { ext: new Map<string, number>(), int: new Map<string, number>() };
    
    swipeHistory.favorites?.forEach((id: string) => {
      const v = allVehicles?.find((av: any) => av.id === id);
      if (v) {
        likedColors.ext.set(v.ext_color, (likedColors.ext.get(v.ext_color) || 0) + 1);
        likedColors.int.set(v.int_color, (likedColors.int.get(v.int_color) || 0) + 1);
      }
    });
    
    swipeHistory.passes?.forEach((id: string) => {
      const v = allVehicles?.find((av: any) => av.id === id);
      if (v) {
        dislikedColors.ext.set(v.ext_color, (dislikedColors.ext.get(v.ext_color) || 0) + 1);
        dislikedColors.int.set(v.int_color, (dislikedColors.int.get(v.int_color) || 0) + 1);
      }
    });

    // Build comprehensive user prompt
    const userPrompt = `ANALYZE THIS VEHICLE:

USER_PROFILE:
  budget: { min: ${preferences.budget_total.min || 0}, max: ${preferences.budget_total.max || 999999} }
  body_style: "${preferences.body_style || ""}"
  model: "${preferences.model || ""}"
  powertrain: "${preferences.powertrain || ""}"
  drivetrain: "${preferences.drivetrain || ""}"
  color_ext_pref: "${preferences.color_ext || ""}"
  color_int_pref: "${preferences.color_int || ""}"
  must_have_features: [${preferences.features_must?.map((f: any) => `"${f}"`).join(", ") || ""}]
  nice_to_have_features: [${preferences.features_nice?.map((f: any) => `"${f}"`).join(", ") || ""}]

CANDIDATE_VEHICLE:
  id: "${vehicle.id}"
  model: "${vehicle.model}"
  trim: "${vehicle.trim}"
  body_style: "${vehicle.body_style}"
  powertrain: "${vehicle.powertrain}"
  drivetrain: "${vehicle.drivetrain}"
  price: ${vehicle.price}
  ext_color: "${vehicle.ext_color}"
  int_color: "${vehicle.int_color}"
  features: [${vehicle.key_features?.map((f: any) => `"${f}"`).join(", ") || ""}]

SWIPE_LEARNING:
  total_favorites: ${swipeHistory.favorites?.length || 0}
  total_passes: ${swipeHistory.passes?.length || 0}
  ext_color_liked_count: ${likedColors.ext.get(vehicle.ext_color) || 0}
  ext_color_disliked_count: ${dislikedColors.ext.get(vehicle.ext_color) || 0}
  int_color_liked_count: ${likedColors.int.get(vehicle.int_color) || 0}
  int_color_disliked_count: ${dislikedColors.int.get(vehicle.int_color) || 0}
  
LIKED_VEHICLES_SUMMARY: ${swipeHistory.favorites?.slice(0, 5).map((id: string) => {
  const v = allVehicles?.find((av: any) => av.id === id);
  return v ? `${v.model}(${v.body_style},${v.powertrain},${v.ext_color})` : id;
}).join(", ") || "none"}

PASSED_VEHICLES_SUMMARY: ${swipeHistory.passes?.slice(0, 5).map((id: string) => {
  const v = allVehicles?.find((av: any) => av.id === id);
  return v ? `${v.model}(${v.body_style},${v.powertrain},${v.ext_color})` : id;
}).join(", ") || "none"}

Calculate match grade (0-100):`;

    console.log("Calling Lovable AI for match scoring...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    console.log("AI raw response:", aiResponse);

    // Extract the integer score
    const scoreMatch = aiResponse.match(/\d+/);
    const matchScore = scoreMatch ? parseInt(scoreMatch[0]) : 50; // Default to 50 if parsing fails
    
    // Clamp to 0-100
    const finalScore = Math.max(0, Math.min(100, matchScore));
    
    console.log(`Vehicle ${vehicle.id}: Score = ${finalScore}`);

    return new Response(
      JSON.stringify({ match_score: finalScore }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-match-scorer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
