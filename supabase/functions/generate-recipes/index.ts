import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { category = "todas", diet = [], ingredients = [], search = "", seed = "" } = body;
    const categoryPart = category && category !== "todas" ? `na categoria "${category}"` : "de qualquer categoria";
    const dietPart = diet.length > 0 ? `As receitas devem ser: ${diet.join(", ")}.` : "";
    const ingredientsPart = ingredients.length > 0 ? `Use preferencialmente estes ingredientes: ${ingredients.join(", ")}.` : "";
    const searchPart = search ? `O usuário busca por: "${search}".` : "";
    const variationSeed = seed || Math.random().toString(36).slice(2);
    const inspirations = ["nordestina", "mineira", "paulista", "gaúcha", "baiana", "amazônica", "italiana abrasileirada", "japonesa abrasileirada", "árabe abrasileirada", "portuguesa", "caipira", "contemporânea", "vegetariana criativa", "comfort food", "de boteco", "de festa", "de domingo em família", "saudável", "low carb", "rápida do dia a dia"];
    const picks = [...inspirations].sort(() => Math.random() - 0.5).slice(0, 3).join(", ");
    const variationPart = `Surpreenda com receitas variadas e criativas — evite os clássicos óbvios. Inspire-se em estilos como: ${picks}. Token de variação (use para diversificar, não cite): ${variationSeed}.`;
    const systemPrompt = "Você é um chef brasileiro especialista e criativo. Sempre varia as sugestões — nunca repita as mesmas receitas óbvias. Sempre responde em JSON válido conforme solicitado, sem markdown, sem texto extra.";
    const userPrompt = `Gere exatamente 6 receitas ${categoryPart}. ${dietPart} ${ingredientsPart} ${searchPart} ${variationPart} Responda APENAS com JSON válido sem markdown no formato: {"recipes":[{"id":"rec-001","title":"Nome","description":"Descrição curta","category":"prato principal","time":"30 min","time_minutes":30,"difficulty":"fácil","diet":[],"servings":4,"ingredients":["2 xícaras de arroz"],"instructions":"1. Passo um.\\n2. Passo dois.","nutrition":{"calories":320,"protein":8,"carbs":60,"fat":5}}]}`;

    const aiRes = await fetch(AI_URL, {
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
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace Lovable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(await aiRes.text());
    }

    const aiData = await aiRes.json();
    const rawText = aiData?.choices?.[0]?.message?.content ?? "";
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    return new Response(JSON.stringify({ recipes: parsed.recipes ?? [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
