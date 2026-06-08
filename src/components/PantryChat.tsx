import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle, X, Send, Loader2, Sparkles, BookmarkPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pantry-chat`;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function cleanMarkdownLine(value: string) {
  return value
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/[`_]/g, "")
    .trim();
}

function isKnownSectionHeading(line: string) {
  const cleaned = cleanMarkdownLine(line).replace(/:$/, "").trim();
  const normalized = normalizeText(cleaned);
  return (
    cleaned.length <= 48 &&
    /^(ingredientes?|modo de preparo|preparo|como fazer|passo a passo|instrucoes?|detalhes?|tempo|rendimento|porcoes?|dificuldade|categoria|dicas?|observacoes?)$/.test(
      normalized,
    )
  );
}

function isIngredientHeading(line: string) {
  return normalizeText(cleanMarkdownLine(line)).includes("ingrediente");
}

function isInstructionHeading(line: string) {
  return /(modo de preparo|preparo|modo de fazer|como fazer|passo a passo|instrucoes?)/.test(
    normalizeText(cleanMarkdownLine(line)),
  );
}

// Detecta se a mensagem contém uma receita (tem ingredientes + modo de preparo)
function detectRecipe(content: string): boolean {
  const lower = normalizeText(content);
  const hasIngredients =
    lower.includes("ingrediente") ||
    lower.includes("xícara") ||
    lower.includes("colher") ||
    lower.includes("gramas") ||
    lower.includes("g de ") ||
    lower.includes("ml de ");
  const hasInstructions =
    lower.includes("preparo") ||
    lower.includes("modo de fazer") ||
    lower.includes("passo") ||
    lower.includes("refog") ||
    lower.includes("cozinhe") ||
    lower.includes("ferv") ||
    lower.includes("misture") ||
    lower.includes("adicione") ||
    lower.includes("finaliz");
  return hasIngredients && hasInstructions;
}

// Extrai título da receita do texto
function extractTitle(content: string): string {
  // Tenta pegar o primeiro título markdown (# ou **)
  const markdownTitle = content.match(/^#{1,3}\s+(.+)/m)?.[1];
  if (markdownTitle) return markdownTitle.trim();
  const boldTitle = content.match(/\*\*(.{5,60})\*\*/)?.[1];
  if (boldTitle) return boldTitle.trim();
  // Fallback: primeira linha não vazia
  const firstLine = content.split("\n").find((l) => l.trim().length > 3);
  return firstLine ? cleanMarkdownLine(firstLine) : "Receita do Chef";
}

// Extrai ingredientes mesmo quando o chef usa markdown, emojis ou lista numerada
function extractIngredients(content: string): string[] {
  const lines = content.split("\n");
  const ingredients: string[] = [];
  let inIngredientSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isIngredientHeading(trimmed)) {
      inIngredientSection = true;
      continue;
    }

    if (inIngredientSection && isKnownSectionHeading(trimmed)) break;

    if (inIngredientSection) {
      const cleaned = cleanMarkdownLine(trimmed);
      if (cleaned && !isKnownSectionHeading(cleaned) && cleaned.length <= 140)
        ingredients.push(cleaned);
    }
  }

  return ingredients.length > 0 ? ingredients : [];
}

// Extrai modo de preparo
function extractInstructions(content: string): string {
  const lines = content.split("\n");
  const steps: string[] = [];
  let inInstructionSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isInstructionHeading(trimmed)) {
      inInstructionSection = true;
      const inlineStep = cleanMarkdownLine(trimmed)
        .replace(
          /^(modo de preparo|preparo|modo de fazer|como fazer|passo a passo|instruções?)\s*:?\s*/i,
          "",
        )
        .trim();
      if (inlineStep) steps.push(inlineStep);
      continue;
    }

    if (inInstructionSection && isKnownSectionHeading(trimmed)) break;
    if (inInstructionSection) steps.push(cleanMarkdownLine(trimmed));
  }

  return steps.length > 0 ? steps.join("\n") : content.trim();
}

function extractTimeMinutes(content: string): number | null {
  const hourMatch = normalizeText(content).match(/(\d+(?:[,.]\d+)?)\s*(?:h|hora|horas)\b/);
  const minuteMatch = normalizeText(content).match(/(\d{1,3})\s*(?:min|minuto|minutos)\b/);
  const hours = hourMatch ? Number(hourMatch[1].replace(",", ".")) * 60 : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  const total = hours + minutes;
  return total > 0 ? Math.round(total) : null;
}

function extractDifficulty(content: string): string | null {
  const lower = normalizeText(content);
  if (lower.includes("dificil")) return "difícil";
  if (lower.includes("medio")) return "médio";
  if (lower.includes("facil")) return "fácil";
  return null;
}

function extractDiet(content: string): string[] {
  const lower = normalizeText(content);
  const diets = [
    ["sem gluten", "sem glúten"],
    ["sem lactose", "sem lactose"],
    ["vegetariano", "vegetariano"],
    ["vegano", "vegano"],
    ["low carb", "low carb"],
  ];
  return diets.filter(([needle]) => lower.includes(needle)).map(([, label]) => label);
}

function extractCategory(content: string): string {
  const match = content.match(/categoria\s*:\s*([^\n]+)/i);
  return match ? cleanMarkdownLine(match[1]).toLowerCase() : "prato principal";
}

function extractCalories(content: string): number | null {
  // Procura padrões tipo "320 kcal", "≈ 450 kcal", "calorias: 380", "380 calorias"
  const patterns = [
    /(\d{2,4})\s*kcal/i,
    /calorias?\s*[:\-–]?\s*(\d{2,4})/i,
    /(\d{2,4})\s*calorias?/i,
  ];
  for (const re of patterns) {
    const m = content.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 30 && n <= 3000) return n;
    }
  }
  return null;
}

function extractCost(content: string, kind: "home" | "delivery"): number | null {
  // Padrão preferido: "R$ 18 em casa vs R$ 45 no delivery"
  const dual = content.match(/r\$\s*(\d{1,4}(?:[.,]\d{1,2})?)\s*em\s*casa[^\d]*r\$\s*(\d{1,4}(?:[.,]\d{1,2})?)/i);
  if (dual) {
    const n = parseFloat((kind === "home" ? dual[1] : dual[2]).replace(",", "."));
    if (!isNaN(n) && n > 0 && n < 1000) return n;
  }
  return null;
}

function extractDescription(content: string, title: string): string {
  const titleNormalized = normalizeText(title);
  const line = content
    .split("\n")
    .map(cleanMarkdownLine)
    .find(
      (item) =>
        item.length >= 24 &&
        item.length <= 180 &&
        !isKnownSectionHeading(item) &&
        normalizeText(item) !== titleNormalized,
    );
  return line ?? "Receita sugerida pelo Chef Despensa";
}

export function PantryChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedMsgIndexes, setSavedMsgIndexes] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        'Oi! 👋 Sou seu chef virtual. Posso ver sua despensa e sugerir o que cozinhar. Me pergunta algo como **"o que posso fazer no almoço?"** 🍳',
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function fetchPantry() {
    if (!user) return [];
    const { data, error } = await supabase
      .from("pantry_items")
      .select("name, quantity, category")
      .eq("user_id", user.id);
    if (error) {
      console.error("pantry fetch", error);
      return [];
    }
    return data ?? [];
  }

  async function saveRecipe(msgIndex: number) {
    if (!user) return;
    const content = messages[msgIndex]?.content;
    if (!content) return;

    const title = extractTitle(content);
    const ingredients = extractIngredients(content);
    const instructions = extractInstructions(content);
    const description = extractDescription(content, title);

    const { error } = await supabase.from("user_recipes").insert({
      user_id: user.id,
      title,
      description,
      category: extractCategory(content),
      time_minutes: extractTimeMinutes(content),
      difficulty: extractDifficulty(content),
      ingredients: ingredients.length > 0 ? ingredients : null,
      instructions,
      diet: extractDiet(content),
      calories_per_serving: extractCalories(content),
      cost_home_brl: extractCost(content, "home"),
      cost_delivery_brl: extractCost(content, "delivery"),
      is_favorite: false,
    });

    if (error) {
      toast.error("Erro ao salvar a receita.");
    } else {
      setSavedMsgIndexes((prev) => new Set(prev).add(msgIndex));
      toast.success(`"${title}" salva em Minhas Receitas! 🎉`);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const pantry = await fetchPantry();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          pantry,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Muitas requisições. Aguarde um momento.");
        else if (resp.status === 402) toast.error("Créditos de IA esgotados.");
        else toast.error("Erro ao falar com o chef.");
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulated = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulated += content;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: accumulated };
                return copy;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro de conexão com o chef.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Abrir chat com o chef"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-105 active:scale-95",
          open && "scale-90",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
            <Sparkles className="h-2.5 w-2.5" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(580px,80vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Chef Despensa</p>
              <p className="text-[11px] opacity-80">Vendo sua despensa em tempo real</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => {
              const isAssistant = m.role === "assistant";
              const hasRecipe = isAssistant && detectRecipe(m.content);
              const isSaved = savedMsgIndexes.has(i);
              const isStreaming = loading && i === messages.length - 1 && isAssistant;

              return (
                <div key={i} className={cn("flex flex-col", !isAssistant && "items-end")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      isAssistant
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {isAssistant ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-strong:text-foreground dark:prose-invert">
                        <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>

                  {/* Botão salvar receita — aparece abaixo da mensagem do chef quando detecta receita */}
                  {hasRecipe && !isStreaming && (
                    <button
                      onClick={() => saveRecipe(i)}
                      disabled={isSaved}
                      className={cn(
                        "mt-1.5 flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
                        isSaved
                          ? "border-green-500/40 bg-green-500/10 text-green-400 cursor-default"
                          : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5",
                      )}
                    >
                      {isSaved ? (
                        <>
                          <Check className="h-3 w-3" /> Salva em Minhas Receitas!
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="h-3 w-3" /> Salvar esta receita
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}

            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> pensando...
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2 border-t border-border bg-background p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="O que posso cozinhar hoje?"
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
