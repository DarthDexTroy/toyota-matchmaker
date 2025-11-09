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
    const { vehicle, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Scoring vehicle:", vehicle.title);

    const systemPrompt = `You are an expert automotive matchmaking AI for Toyota vehicles. Your job is to analyze how well a specific vehicle matches a customer's preferences and return a match score from 0-100.

Scoring Guidelines:
- Body Style Match (20 points max): Perfect match = 20, no preference = 20, mismatch = 0
- Price Range Match (25 points max): Within budget = 25, slightly over = 15-20, way under = 15, way over = 0-10
- Powertrain Match (20 points max): Exact match = 20, no preference = 20, compatible = 10, mismatch = 0
- Drivetrain Match (10 points max): Exact match = 10, no preference = 10, mismatch = 0
- Color Match (15 points max): Exact/similar = 15, no preference = 15, different family = 0-8
- Model/Trim Bonus (10 points max): Matches specific model/trim preference = 10

Consider:
- A customer with no preferences should get high scores (80-100) on suitable vehicles
- Being significantly over budget is worse than being under budget
- Similar colors in the same family (e.g., red/crimson, silver/gray) should get partial credit
- Hybrid/EV preferences strongly indicate eco-consciousness
- AWD/4WD preferences often indicate need for capability

Return ONLY a JSON object with this exact format:
{"score": 85, "reasoning": "Brief 1-2 sentence explanation of the score"}

Score must be an integer 0-100.`;

    const userPrompt = `Vehicle:
- Model: ${vehicle.model}
- Title: ${vehicle.title}
- Price: $${vehicle.price.toLocaleString()}
- Body Style: ${vehicle.body_style}
- Powertrain: ${vehicle.powertrain}
- Drivetrain: ${vehicle.drivetrain}
- Exterior Color: ${vehicle.ext_color}
- Interior Color: ${vehicle.int_color}
- Key Features: ${vehicle.key_features.join(", ")}

User Preferences:
- Body Style: ${preferences.body_style || "No preference"}
- Model: ${preferences.model || "No preference"}
- Trim: ${preferences.trim || "No preference"}
- Powertrain: ${preferences.powertrain || "No preference"}
- Drivetrain: ${preferences.drivetrain || "No preference"}
- Exterior Color: ${preferences.color_ext || "No preference"}
- Budget Range: $${preferences.budget_total.min?.toLocaleString() || "0"} - $${preferences.budget_total.max?.toLocaleString() || "unlimited"}
- Must-Have Features: ${preferences.features_must.length > 0 ? preferences.features_must.join(", ") : "None"}
- Nice-to-Have Features: ${preferences.features_nice.length > 0 ? preferences.features_nice.join(", ") : "None"}

Calculate the match score and provide reasoning.`;

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
    
    const assistantMessage = data.choices[0].message.content;
    
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
