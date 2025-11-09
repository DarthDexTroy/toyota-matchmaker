import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vehicle, preferences, swipeHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Scoring vehicle:", vehicle.title);

    // Build learning context from swipe history
    let learningContext = "";
    if (swipeHistory && swipeHistory.favorites && swipeHistory.passes) {
      const favoritesContext = swipeHistory.favorites.length > 0 
        ? `\n\nVehicles User LIKED (swiped right):\n${swipeHistory.favorites.map((v: any) => 
            `- ${v.title}: $${v.price.toLocaleString()}, ${v.body_style}, ${v.powertrain}, ${v.drivetrain}, ${v.ext_color}`
          ).join('\n')}`
        : "";
      
      const passesContext = swipeHistory.passes.length > 0
        ? `\n\nVehicles User DISLIKED (swiped left):\n${swipeHistory.passes.map((v: any) => 
            `- ${v.title}: $${v.price.toLocaleString()}, ${v.body_style}, ${v.powertrain}, ${v.drivetrain}, ${v.ext_color}`
          ).join('\n')}`
        : "";
      
      learningContext = favoritesContext + passesContext;
    }

    const systemPrompt = `You are an expert automotive matchmaking AI for Toyota vehicles. You must use a strict scoring algorithm and learn from user behavior.

CRITICAL SCORING ALGORITHM - Follow this exactly:

1. BODY STYLE (0-20 points):
   - Exact match to preference: 20 points
   - No preference stated: 15 points (neutral)
   - Different body style: 0 points
   
2. PRICE RANGE (0-25 points):
   - Within budget (min to max): 25 points
   - 0-10% over max: 20 points
   - 10-20% over max: 12 points
   - 20-30% over max: 5 points
   - 30%+ over max: 0 points
   - Under minimum (20%+ below): 10 points (may lack features)
   - No budget set: 20 points

3. POWERTRAIN (0-20 points):
   - Exact match: 20 points
   - Compatible (hybrid when EV wanted, or vice versa): 12 points
   - No preference: 15 points
   - Mismatch (gas when hybrid/EV wanted): 5 points

4. DRIVETRAIN (0-10 points):
   - Exact match: 10 points
   - Compatible upgrade (AWD when FWD wanted): 8 points
   - No preference: 8 points
   - Downgrade (FWD when AWD wanted): 3 points

5. EXTERIOR COLOR (0-15 points):
   - Exact match: 15 points
   - Same color family: 10 points (red/crimson, silver/gray/white, blue/navy)
   - No preference: 12 points
   - Different color family: 3 points

6. FEATURE MATCH (0-10 points):
   - Has all must-have features: +5 points
   - Has 50%+ nice-to-have features: +3 points
   - Has 25-49% nice-to-have: +2 points
   - Missing must-haves: 0 points total

ADAPTIVE LEARNING RULES:
- If user liked similar vehicles, ADD 5-15 bonus points
- If user passed similar vehicles, SUBTRACT 10-20 points
- Learn patterns: price sensitivity, body style preferences, powertrain importance
- If user consistently likes vehicles over budget, be less strict on price
- If user passes vehicles in stated preference, that preference may not be important
- Score distribution should range from 30-95, with most vehicles between 50-80
- Only exceptional matches score above 85

STRICT REQUIREMENTS:
- You MUST calculate each category separately
- You MUST show your math in reasoning
- Scores should vary significantly (20-95 range)
- DO NOT give everything 85-95 scores
- BE CRITICAL - most vehicles should score 55-75
- Only perfect matches deserve 90+

Return ONLY valid JSON:
{"score": 72, "reasoning": "Brief calculation: Body(15) + Price(20) + Power(12) + Drive(8) + Color(10) + Features(2) + Learning(5) = 72"}`;


    const userPrompt = `VEHICLE TO SCORE:
- Model: ${vehicle.model}
- Title: ${vehicle.title}
- Price: $${vehicle.price.toLocaleString()}
- Body Style: ${vehicle.body_style}
- Powertrain: ${vehicle.powertrain}
- Drivetrain: ${vehicle.drivetrain}
- Exterior Color: ${vehicle.ext_color}
- Interior Color: ${vehicle.int_color}
- Key Features: ${vehicle.key_features.join(", ")}

USER STATED PREFERENCES:
- Body Style: ${preferences.body_style || "No preference"}
- Model: ${preferences.model || "No preference"}
- Trim: ${preferences.trim || "No preference"}
- Powertrain: ${preferences.powertrain || "No preference"}
- Drivetrain: ${preferences.drivetrain || "No preference"}
- Exterior Color: ${preferences.color_ext || "No preference"}
- Budget Range: $${preferences.budget_total.min?.toLocaleString() || "0"} - $${preferences.budget_total.max?.toLocaleString() || "unlimited"}
- Must-Have Features: ${preferences.features_must.length > 0 ? preferences.features_must.join(", ") : "None"}
- Nice-to-Have Features: ${preferences.features_nice.length > 0 ? preferences.features_nice.join(", ") : "None"}
${learningContext}

Calculate the match score using the algorithm. Show your category scores in reasoning.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", data);
    
    let assistantMessage = data.choices[0].message.content;
    
    // Strip markdown code blocks if present
    assistantMessage = assistantMessage.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    console.log("Cleaned AI message:", assistantMessage);
    
    // Parse the JSON response from the AI
    const result = JSON.parse(assistantMessage);
    
    // Ensure score is between 0-100
    const score = Math.min(100, Math.max(0, Math.round(result.score)));

    return new Response(
      JSON.stringify({ score, reasoning: result.reasoning }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in match-scorer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
