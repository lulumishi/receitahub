import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  category?: string;
  diet?: string[];
  ingredients?: string[];
  search?: string;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json().catch(() => ({}));
    const { category = "todas", diet = [], ingredients = [], search = "" } = body;

    // Monta o prompt baseado nos filtros recebidos
    const categoryPart =
      category && category !== "todas" ? `na categoria "${category}"` : "de qualquer categoria";

    const dietPart =
      diet.length > 0 ? `As receitas devem ser: ${diet.join(", ")}.` : "";

    const ingredientsPart =
      ingredients.length > 0
        ? `Use preferencialmente estes ingredientes que o usuário tem em casa: ${ingredients.join(", ")}.`
        : "";

    const searchPart = search
      ? `O usuário está buscando por: "${search}".`
      : "";

    const prompt = `
Você é um chef brasileiro especialista em culinária do dia a dia.
Gere exatamente 6 receitas ${categoryPart} para cozinheiros caseiros brasileiros.
${dietPart}
${ingredientsPart}
${searchPart}

Responda APENAS com um JSON válido, sem nenhum texto antes ou depois, sem markdown, sem blocos de código.
O JSON deve ter exatamente este formato:

{
  "recipes": [
    {
      "id": "uuid-unico-aqui",
      "title": "Nome da receita",
      "description": "Descrição curta e apetitosa em 1-2 frases",
      "category": "prato principal",
      "time": "30 min",
      "time_minutes": 30,
      "difficulty": "fácil",
      "diet": ["vegano"],
      "servings": 4,
      "ingredients": [
        "2 xícaras de arroz",
        "1 cebola picada",
        "3 dentes de alho"
      ],
      "instructions": "**Preparo:**\\n\\n1. Refogue o alho e a cebola no azeite por 3 minutos.\\n2. Adicione o arroz e mexa por 2 minutos.\\n3. Acrescente 4 xícaras de água quente e sal a gosto.\\n4. Tampe e cozinhe em fogo baixo por 15 minutos.",
      "nutrition": {
        "calories": 320,
        "protein": 8,
        "carbs": 60,
        "fat": 5
      }
    }
  ]
}

Regras importantes:
- Gere exatamente 6 receitas
- Os IDs devem ser strings únicas simples como "rec-001", "rec-002" etc.
- O campo "diet" deve ser um array com zero ou mais dos valores: "vegano", "vegetariano", "sem glúten", "low carb"
- O campo "difficulty" deve ser: "fácil", "médio" ou "difícil"
- O campo "instructions" deve ter o modo de preparo completo em passos numerados usando markdown
- Todas as receitas devem ser em português do Brasil
- Receitas práticas e acessíveis para o dia a dia
`.trim();

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return new Response(
        JSON.stringify({ error: "Erro ao chamar a API do Gemini", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Remove possíveis blocos de código markdown que o modelo às vezes insere
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: { recipes: unknown[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error. Raw text:", rawText);
      return new Response(
        JSON.stringify({ error: "Resposta inválida do modelo", raw: rawText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ recipes: parsed.recipes ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
