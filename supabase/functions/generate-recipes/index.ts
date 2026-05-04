import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { category = "todas", diet = [], ingredients = [], search = "" } = body;
    const categoryPart = category && category !== "todas" ? `na categoria "${category}"` : "de qualquer categoria";
    const dietPart = diet.length > 0 ? `As receitas devem ser: ${diet.join(", ")}.` : "";
    const ingredientsPart = ingredients.length > 0 ? `Use preferencialmente estes ingredientes: ${ingredients.join(", ")}.` : "";
    const searchPart = search ? `O usuário busca por: "${search}".` : "";
    const prompt = `Você é um chef brasileiro. Gere exatamente 6 receitas ${categoryPart}. ${dietPart} ${ingredientsPart} ${searchPart} Responda APENAS com JSON válido sem markdown: {"recipes":[{"id":"rec-001","title":"Nome","description":"Descrição curta","category":"prato principal","time":"30 min","time_minutes":30,"difficulty":"fácil","diet":[],"servings":4,"ingredients":["2 xícaras de arroz"],"instructions":"1. Passo um.\\n2. Passo dois.","nutrition":{"calories":320,"protein":8,"carbs":60,"fat":5}}]}`;
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 4096 } }),
    });
    if (!geminiRes.ok) throw new Error(await geminiRes.text());
    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```$/i,"").trim();
    const parsed = JSON.parse(cleaned);
    return new Response(JSON.stringify({ recipes: parsed.recipes ?? [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
