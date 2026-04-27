// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, diet, ingredients, search } = await req.json().catch(() => ({}));
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const systemPrompt =
      "Você é um chef brasileiro criativo. Gere receitas em português do Brasil, realistas e factíveis. Use medidas brasileiras. Responda APENAS chamando a função fornecida.";

    const userPrompt = `Gere 6 receitas variadas e originais com os seguintes critérios:
- Categoria: ${category && category !== "todas" ? category : "qualquer"}
- Dieta: ${diet && diet.length ? diet.join(", ") : "qualquer"}
- Ingredientes disponíveis na despensa: ${ingredients && ingredients.length ? ingredients.join(", ") : "qualquer"}
- Termo de busca: ${search || "nenhum"}

Para matchPercent, use 100 se a receita usa principalmente ingredientes da despensa, e valores entre 60-95 caso contrário.
Categorias válidas: "Prato principal", "Massa", "Salada", "Sobremesa", "Pães", "Lanche".
Dificuldade: "fácil", "médio" ou "difícil".`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_recipes",
                description: "Retorna uma lista de 6 receitas",
                parameters: {
                  type: "object",
                  properties: {
                    recipes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "slug único kebab-case" },
                          title: { type: "string" },
                          category: { type: "string" },
                          time: { type: "number", description: "tempo em minutos" },
                          difficulty: { type: "string", enum: ["fácil", "médio", "difícil"] },
                          diet: { type: "array", items: { type: "string" } },
                          description: { type: "string", description: "1-2 frases envolventes" },
                          matchPercent: { type: "number" },
                          ingredients: { type: "array", items: { type: "string" } },
                        },
                        required: [
                          "id",
                          "title",
                          "category",
                          "time",
                          "difficulty",
                          "diet",
                          "description",
                          "matchPercent",
                          "ingredients",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["recipes"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_recipes" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar receitas" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { recipes: [] };

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipes error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
