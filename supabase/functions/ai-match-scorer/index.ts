import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are "Toyota Match Grade". Your ONLY job is to compute a single integer 0–100 match grade for ONE candidate Toyota vehicle given a user's preferences, current weights, and swipe history. You MUST output only that integer with no words, no JSON, no punctuation, and no trailing newline.

SCORING RULES:
- Hard exclusions return 0:
  * Price exceeds budget by >20%
  * Missing must-have features
  * Body style completely mismatched (if specified)

- Core scoring (0-100):
  * Price fit (25 pts): How well price matches budget
  * Body style match (20 pts): Exact match = 20, similar = 10, different = 0
  * Powertrain preference (15 pts): Matches user preference
  * Drivetrain preference (10 pts): Matches user preference
  * Color match (10 pts): Exterior color preference
  * Must-have features (10 pts): All present = 10
  * Nice-to-have features (10 pts): Proportional to how many present

- Swipe learning (adjust by ±15 pts):
  * If user disliked similar vehicles (same body/powertrain): reduce score
  * If user liked similar vehicles: increase score
  * More swipes = stronger adjustment

- Output variance: Aim for realistic distribution (most vehicles 50-85, exceptional 85-95, poor matches 20-50)

USER INPUT STRUCTURE:
{
  "user_profile": {
    "budget": { "min": number, "max": number },
    "body_style": string,
    "model": string,
    "powertrain": string,
    "drivetrain": string,
    "color_ext": string,
    "color_int": string,
    "features_must": string[],
    "features_nice": string[]
  },
  "swipe_history": {
    "favorites": string[],  // vehicle IDs user liked
    "passes": string[]      // vehicle IDs user passed
  },
  "candidate_vehicle": {
    "id": string,
    "model": string,
    "body_style": string,
    "powertrain": string,
    "drivetrain": string,
    "ext_color": string,
    "int_color": string,
    "price": number,
    "key_features": string[]
  },
  "all_vehicles": Vehicle[]  // for swipe learning context
}

Analyze these inputs and output ONLY a single integer between 0 and 100.`;

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

    // Build the user prompt with all context
    const userPrompt = `Calculate match grade for:

USER PREFERENCES:
- Budget: $${preferences.budget_total.min || 0} - $${preferences.budget_total.max || 999999}
- Body Style: ${preferences.body_style || "any"}
- Model: ${preferences.model || "any"}
- Powertrain: ${preferences.powertrain || "any"}
- Drivetrain: ${preferences.drivetrain || "any"}
- Exterior Color: ${preferences.color_ext || "any"}
- Interior Color: ${preferences.color_int || "any"}
- Must-Have Features: ${preferences.features_must?.join(", ") || "none"}
- Nice-to-Have Features: ${preferences.features_nice?.join(", ") || "none"}

CANDIDATE VEHICLE:
- ID: ${vehicle.id}
- Model: ${vehicle.model} ${vehicle.trim}
- Body Style: ${vehicle.body_style}
- Powertrain: ${vehicle.powertrain}
- Drivetrain: ${vehicle.drivetrain}
- Price: $${vehicle.price}
- Exterior Color: ${vehicle.ext_color}
- Interior Color: ${vehicle.int_color}
- Features: ${vehicle.key_features?.join(", ") || "none"}

SWIPE HISTORY:
- Favorites (${swipeHistory.favorites?.length || 0}): ${swipeHistory.favorites?.map((id: string) => {
  const v = allVehicles?.find((av: any) => av.id === id);
  return v ? `${v.model}(${v.body_style},${v.powertrain})` : id;
}).join(", ") || "none"}
- Passes (${swipeHistory.passes?.length || 0}): ${swipeHistory.passes?.map((id: string) => {
  const v = allVehicles?.find((av: any) => av.id === id);
  return v ? `${v.model}(${v.body_style},${v.powertrain})` : id;
}).join(", ") || "none"}

Output only the integer match grade (0-100):`;

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
        temperature: 0.3, // Low temperature for consistent scoring
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
