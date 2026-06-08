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
    const { messages, pantry } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const pantryList =
      Array.isArray(pantry) && pantry.length
        ? pantry
            .map(
              (p: any) =>
                `- ${p.name}${p.quantity ? ` (${p.quantity})` : ""}${
                  p.category ? ` [${p.category}]` : ""
                }`
            )
            .join("\n")
        : "(despensa vazia ou usuário não logado)";

    const systemPrompt = `Você é um chef brasileiro simpático e criativo, especialista em aproveitar ingredientes da despensa para sugerir receitas. Responda SEMPRE em português do Brasil, de forma direta, amigável e com emojis quando fizer sentido.

DESPENSA ATUAL DO USUÁRIO:
${pantryList}

Regras:
- Sugira receitas que possam ser feitas COM OS INGREDIENTES DA DESPENSA acima sempre que possível.
- Se faltar 1 ou 2 ingredientes essenciais, mencione claramente o que precisa comprar.
- Seja prático: dê o nome da receita, ingredientes principais, tempo aproximado e um modo de preparo curto em passos.
- Se a despensa estiver vazia, peça gentilmente para o usuário cadastrar itens em "Minha Despensa".
- Mantenha respostas concisas (no máximo ~250 palavras), use markdown leve (negrito, listas).
- Sempre que sugerir uma receita completa, inclua duas linhas:
  - "**Calorias:** ~320 kcal/porção"
  - "**Custo:** ~R$ 18 em casa vs ~R$ 45 no delivery" (estimativa em reais; delivery costuma ser 2-3x o caseiro).`;

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
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...(Array.isArray(messages) ? messages : []),
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }),
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
      return new Response(JSON.stringify({ error: "Erro ao consultar IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("pantry-chat error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
