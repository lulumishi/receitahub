import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/minhas-receitas")({
  component: MyRecipesPage,
  head: () => ({
    meta: [
      { title: "Minhas receitas — receitahub" },
      { name: "description", content: "Suas receitas favoritas, salvas e organizadas em um só lugar." },
    ],
  }),
});

type UserRecipe = {
  id: string; title: string; image_url: string | null; category: string | null;
  time_minutes: number | null; difficulty: string | null; diet: string[] | null;
  description: string | null; is_favorite: boolean;
  ingredients: string[] | null; instructions: string | null;
  calories_per_serving: number | null; rating: number | null;
  notes: string | null; times_cooked: number;
};

type CalorieEntry = {
  id: string; recipe_id: string | null; recipe_title: string;
  calories: number; consumed_at: string;
};

const CATEGORY_STYLE: Record<string, { emoji: string; bg: string }> = {
  "prato principal": { emoji: "🍗", bg: "from-amber-900/40 to-amber-800/20" },
  "massa":           { emoji: "🍝", bg: "from-orange-900/40 to-orange-800/20" },
  "salada":          { emoji: "🥗", bg: "from-green-900/40 to-green-800/20" },
  "sobremesa":       { emoji: "🍰", bg: "from-pink-900/40 to-pink-800/20" },
  "pães":            { emoji: "🍞", bg: "from-yellow-900/40 to-yellow-800/20" },
  "sopa":            { emoji: "🍲", bg: "from-red-900/40 to-red-800/20" },
  "café da manhã":   { emoji: "🥞", bg: "from-yellow-900/40 to-amber-800/20" },
  "lanche":          { emoji: "🥪", bg: "from-lime-900/40 to-lime-800/20" },
  "bebida":          { emoji: "🥤", bg: "from-cyan-900/40 to-cyan-800/20" },
  "conserva":        { emoji: "🫙", bg: "from-zinc-800/60 to-zinc-700/30" },
  "acompanhamento":  { emoji: "🥦", bg: "from-emerald-900/40 to-emerald-800/20" },
  "default":         { emoji: "🍽️", bg: "from-zinc-800/60 to-zinc-700/30" },
};

function getCategoryStyle(category: string | null) {
  const lower = category?.toLowerCase() ?? "";
  const key = Object.keys(CATEGORY_STYLE).find((k) => lower.includes(k));
  return CATEGORY_STYLE[key ?? "default"];
}

function RecipeCover({ category, size = "card" }: { category: string | null; size?: "card" | "modal" }) {
  const { emoji, bg } = getCategoryStyle(category);
  const h = size === "modal" ? "h-56" : "aspect-[4/3]";
  return (
    <div className={`${h} w-full bg-gradient-to-br ${bg} flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 bg-charcoal/20" />
      <span className={`relative ${size === "modal" ? "text-8xl" : "text-6xl"} select-none drop-shadow-lg`}>{emoji}</span>
    </div>
  );
}

// ─── Modal de detalhes da receita salva ──────────────────────────────────────
function RecipeDetailModal({ recipe, onClose, onDelete, onFavorite }: {
  recipe: UserRecipe; onClose: () => void;
  onDelete: (id: string) => void; onFavorite: (id: string, v: boolean) => void;
}) {
  const [servings, setServings] = useState(4);
  const baseServings = 4;
  const ratio = servings / baseServings;

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function scaleIngredient(text: string) {
    return text.replace(/(\d+[\d.,/]*)/g, (m) => {
      const n = parseFloat(m.replace(",", "."));
      if (isNaN(n)) return m;
      const s = n * ratio;
      return s % 1 === 0 ? String(s) : s.toFixed(1);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 bg-charcoal border border-border rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative rounded-t-3xl overflow-hidden">
          <RecipeCover category={recipe.category} size="modal" />
          <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-charcoal/80 text-cream hover:bg-charcoal transition text-lg">×</button>
          <button onClick={() => onFavorite(recipe.id, !recipe.is_favorite)}
            className={`absolute top-4 left-4 h-8 w-8 flex items-center justify-center rounded-full transition ${recipe.is_favorite ? "bg-blush text-charcoal" : "bg-charcoal/80 text-cream/60 hover:text-blush"}`}
            title={recipe.is_favorite ? "Remover dos favoritos" : "Favoritar"}>
            ★
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {recipe.diet?.map((d) => <span key={d} className="text-[10px] uppercase tracking-wider bg-blush/20 text-blush px-2 py-0.5 rounded-full">{d}</span>)}
            </div>
            <h2 className="font-display text-3xl text-cream leading-tight drop-shadow-lg">{recipe.title}</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex gap-4 text-sm text-cream/60">
            {recipe.time_minutes && <span>⏱ {recipe.time_minutes} min</span>}
            {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
            {recipe.category && <span>🍽 {recipe.category}</span>}
          </div>
          {recipe.description && <p className="text-cream/70 text-sm leading-relaxed">{recipe.description}</p>}

          {/* Slider de porções */}
          <div className="bg-charcoal-light border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-cream/70">Porções</span>
              <span className="text-sm font-medium text-cream">{servings}</span>
            </div>
            <input type="range" min={1} max={12} step={1} value={servings} onChange={(e) => setServings(Number(e.target.value))} className="w-full accent-[#C97B84]" />
            <div className="flex justify-between text-[10px] text-cream/40 mt-1"><span>1</span><span>6</span><span>12</span></div>
          </div>

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-blush mb-3">Ingredientes</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-cream/80">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blush/60 flex-shrink-0" />
                    {scaleIngredient(ing)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.instructions && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-blush mb-3">Modo de preparo</h3>
              <div className="text-sm text-cream/80 leading-relaxed space-y-2">
                {recipe.instructions.split("\n").map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>
          )}

          <button onClick={() => { onDelete(recipe.id); onClose(); }}
            className="w-full py-3 rounded-full text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition">
            Remover receita
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de importar receita ────────────────────────────────────────────────
function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (recipe: Partial<UserRecipe>) => void }) {
  const [tab, setTab] = useState<"texto" | "url">("texto");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleTextImport() {
    if (!text.trim()) return;
    setLoading(true); setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("parse-recipe", {
        body: { text },
      });
      if (fnError || data?.error) throw new Error(fnError?.message ?? data?.error ?? "Erro ao processar");
      onImport(data.recipe);
      onClose();
    } catch (e) {
      onImport({ title: "Receita importada", instructions: text, category: "prato principal" });
      onClose();
    } finally { setLoading(false); }
  }

  async function handleUrlImport() {
    if (!url.trim()) return;
    setLoading(true); setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("parse-recipe", {
        body: { url },
      });
      if (fnError || data?.error) throw new Error(fnError?.message ?? data?.error ?? "Erro ao processar");
      onImport(data.recipe);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível importar dessa URL.");
    } finally { setLoading(false); }
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError("");
    try {
      const content = await file.text();
      const { data, error: fnError } = await supabase.functions.invoke("parse-recipe", {
        body: { text: content },
      });
      if (fnError || data?.error) throw new Error(fnError?.message ?? data?.error ?? "Erro ao processar");
      onImport(data.recipe);
      onClose();
    } catch {
      setError("Não foi possível ler o arquivo.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 bg-charcoal border border-border rounded-3xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-cream">Importar receita</h2>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full text-cream/60 hover:text-cream transition text-lg">×</button>
          </div>

          <div className="flex gap-2 mb-6">
            {(["texto", "url"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-sm capitalize transition border ${tab === t ? "bg-blush text-charcoal border-blush" : "border-border text-cream/60 hover:text-cream"}`}>{t === "texto" ? "Colar texto / arquivo" : "URL do site"}</button>
            ))}
          </div>

          {tab === "texto" && (
            <div className="space-y-4">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
                placeholder="Cole aqui o texto da receita (ingredientes, modo de preparo...)"
                className="w-full bg-charcoal-light border border-border rounded-2xl p-4 text-cream placeholder:text-cream/40 text-sm focus:outline-none focus:border-blush/50 resize-none" />
              <div className="flex items-center gap-3">
                <button onClick={() => fileRef.current?.click()} disabled={loading}
                  className="px-4 py-2 rounded-full border border-border text-cream/70 text-sm hover:border-blush/40 transition">
                  📄 Importar .txt
                </button>
                <input ref={fileRef} type="file" accept=".txt,.pdf" className="hidden" onChange={handleFileImport} />
                <button onClick={handleTextImport} disabled={loading || !text.trim()}
                  className="ml-auto px-6 py-2 rounded-full bg-blush text-charcoal text-sm font-medium hover:bg-blush-deep transition disabled:opacity-50">
                  {loading ? "Importando…" : "Importar"}
                </button>
              </div>
            </div>
          )}

          {tab === "url" && (
            <div className="space-y-4">
              <p className="text-sm text-cream/60">Cole a URL de um site de receitas (TudoGostoso, Panelinha, blogs, etc).</p>
              <input value={url} onChange={(e) => setUrl(e.target.value)} type="url"
                placeholder="https://www.tudogostoso.com.br/receita/..."
                className="w-full bg-charcoal-light border border-border rounded-full px-5 py-3 text-cream placeholder:text-cream/40 text-sm focus:outline-none focus:border-blush/50" />
              <p className="text-xs text-cream/40">A IA vai extrair título, ingredientes e modo de preparo automaticamente.</p>
              <button onClick={handleUrlImport} disabled={loading || !url.trim()}
                className="w-full py-3 rounded-full bg-blush text-charcoal text-sm font-medium hover:bg-blush-deep transition disabled:opacity-50">
                {loading ? "Importando…" : "Importar da URL"}
              </button>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
function MyRecipesPage() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<UserRecipe | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState<"todas" | "favoritas" | "melhor avaliadas" | "mais feitas">("todas");
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([]);

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/login" });
  }, [authLoading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    void (async () => {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const [recipesRes, caloriesRes] = await Promise.all([
        supabase.from("user_recipes")
          .select("id, title, image_url, category, time_minutes, difficulty, diet, description, is_favorite, ingredients, instructions, calories_per_serving, rating, notes, times_cooked")
          .order("created_at", { ascending: false }),
        supabase.from("calorie_log")
          .select("id, recipe_id, recipe_title, calories, consumed_at")
          .eq("consumed_at", today)
          .order("created_at", { ascending: false }),
      ]);
      if (!recipesRes.error && recipesRes.data) setRecipes(recipesRes.data as UserRecipe[]);
      if (!caloriesRes.error && caloriesRes.data) setCalorieEntries(caloriesRes.data as CalorieEntry[]);
      setLoading(false);
    })();
  }, [session]);

  async function handleDelete(id: string) {
    await supabase.from("user_recipes").delete().eq("id", id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleFavorite(id: string, value: boolean) {
    await supabase.from("user_recipes").update({ is_favorite: value }).eq("id", id);
    setRecipes((prev) => prev.map((r) => r.id === id ? { ...r, is_favorite: value } : r));
    if (selectedRecipe?.id === id) setSelectedRecipe((prev) => prev ? { ...prev, is_favorite: value } : prev);
  }

  async function handleRate(id: string, rating: number) {
    await supabase.from("user_recipes").update({ rating }).eq("id", id);
    setRecipes((prev) => prev.map((r) => r.id === id ? { ...r, rating } : r));
    if (selectedRecipe?.id === id) setSelectedRecipe((prev) => prev ? { ...prev, rating } : prev);
  }

  async function handleNotes(id: string, notes: string) {
    await supabase.from("user_recipes").update({ notes }).eq("id", id);
    setRecipes((prev) => prev.map((r) => r.id === id ? { ...r, notes } : r));
  }

  async function handleAteIt(recipe: UserRecipe, ev?: React.MouseEvent) {
    if (!session) return;
    ev?.stopPropagation();
    const calories = recipe.calories_per_serving;
    if (!calories) {
      alert("Essa receita ainda não tem calorias estimadas. Salve uma nova ou edite manualmente.");
      return;
    }
    const { data, error } = await supabase.from("calorie_log").insert({
      user_id: session.user.id,
      recipe_id: recipe.id,
      recipe_title: recipe.title,
      calories,
    }).select().single();
    if (!error && data) {
      setCalorieEntries((prev) => [data as CalorieEntry, ...prev]);
      // incrementa times_cooked
      const next = (recipe.times_cooked ?? 0) + 1;
      await supabase.from("user_recipes").update({ times_cooked: next }).eq("id", recipe.id);
      setRecipes((prev) => prev.map((r) => r.id === recipe.id ? { ...r, times_cooked: next } : r));
    }
  }

  async function handleRemoveCalorie(id: string) {
    await supabase.from("calorie_log").delete().eq("id", id);
    setCalorieEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleImport(partial: Partial<UserRecipe>) {
    if (!session) return;
    const { data, error } = await supabase.from("user_recipes").insert({
      user_id: session.user.id,
      title: partial.title ?? "Receita importada",
      description: partial.description ?? null,
      category: partial.category ?? "prato principal",
      instructions: partial.instructions ?? null,
      ingredients: partial.ingredients ?? null,
      diet: partial.diet ?? [],
      calories_per_serving: partial.calories_per_serving ?? null,
      time_minutes: partial.time_minutes ?? null,
      difficulty: partial.difficulty ?? null,
      is_favorite: false,
    }).select().single();
    if (!error && data) setRecipes((prev) => [data as UserRecipe, ...prev]);
  }

  if (authLoading || !session) return (
    <div className="min-h-screen bg-charcoal text-cream flex items-center justify-center">
      <div className="text-cream/50">carregando...</div>
    </div>
  );

  const favorites = recipes.filter((r) => r.is_favorite);
  const totalCalories = calorieEntries.reduce((sum, e) => sum + e.calories, 0);
  const cookedCount = recipes.reduce((sum, r) => sum + (r.times_cooked ?? 0), 0);

  let displayed = recipes;
  if (filter === "favoritas") displayed = favorites;
  else if (filter === "melhor avaliadas") displayed = [...recipes].filter((r) => r.rating).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  else if (filter === "mais feitas") displayed = [...recipes].filter((r) => (r.times_cooked ?? 0) > 0).sort((a, b) => (b.times_cooked ?? 0) - (a.times_cooked ?? 0));

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600&display=swap" />
      <AppHeader />

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-blush mb-3">sua coleção</div>
            <h1 className="text-5xl md:text-6xl text-cream leading-tight">
              minhas <em className="text-blush font-display italic">receitas</em>
            </h1>
            <p className="mt-4 text-cream/70 max-w-xl">Tudo que você salvou para preparar depois.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowImport(true)}
              className="px-5 py-3 rounded-full border border-border text-sm hover:border-blush/40 transition">
              📥 Importar receita
            </button>
          </div>
        </div>

        {/* Painel Calorias do dia */}
        <div className="mt-10 bg-gradient-to-br from-blush/15 to-blush/5 border border-blush/30 rounded-3xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-blush mb-2">🔥 Calorias hoje</div>
              <div className="font-display text-5xl text-cream">{totalCalories.toLocaleString("pt-BR")} <span className="text-2xl text-cream/50">kcal</span></div>
              <p className="text-xs text-cream/40 mt-2">Estimativas da IA — não substituem rótulo nutricional.</p>
            </div>
            {calorieEntries.length > 0 && (
              <div className="flex-1 min-w-[240px] max-w-md space-y-1.5">
                {calorieEntries.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-sm bg-charcoal/40 rounded-full px-3 py-1.5">
                    <span className="text-cream/80 truncate flex-1">{e.recipe_title}</span>
                    <span className="text-blush text-xs">{e.calories} kcal</span>
                    <button onClick={() => handleRemoveCalorie(e.id)} className="text-cream/40 hover:text-red-400 transition">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { l: "Salvas", v: recipes.length },
            { l: "Já preparadas", v: cookedCount },
            { l: "Favoritas", v: favorites.length },
          ].map((s) => (
            <div key={s.l} className="bg-charcoal-light rounded-2xl p-5 border border-border">
              <div className="text-xs uppercase tracking-wider text-cream/50">{s.l}</div>
              <div className="font-display text-3xl text-cream mt-2">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="mt-8 flex gap-2 flex-wrap">
          {(["todas", "favoritas", "melhor avaliadas", "mais feitas"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition border ${filter === f ? "bg-blush text-charcoal border-blush" : "border-border text-cream/60 hover:text-cream"}`}>{f}</button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        {loading ? (
          <div className="text-center py-16 text-cream/50">carregando receitas...</div>
        ) : displayed.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((r) => (
              <article key={r.id} onClick={() => setSelectedRecipe(r)}
                className="group cursor-pointer bg-charcoal-light rounded-2xl overflow-hidden border border-border hover:border-blush/40 transition-all">
                <RecipeCover category={r.category} size="card" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      {r.category && <div className="text-xs uppercase tracking-widest text-blush/90 mb-2">{r.category}{r.time_minutes ? ` · ${r.time_minutes} min` : ""}</div>}
                      <h3 className="font-display text-2xl text-cream leading-tight mb-2 group-hover:text-blush transition">{r.title}</h3>
                      {r.description && <p className="text-sm text-cream/60 line-clamp-2">{r.description}</p>}
                    </div>
                    {r.is_favorite && <span className="text-blush text-lg flex-shrink-0">★</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border/50">
                    {r.calories_per_serving && (
                      <span className="text-[11px] bg-blush/15 text-blush px-2 py-1 rounded-full">≈ {r.calories_per_serving} kcal</span>
                    )}
                    {r.rating && (
                      <span className="text-[11px] bg-amber-500/15 text-amber-400 px-2 py-1 rounded-full">{"★".repeat(r.rating)}</span>
                    )}
                    {(r.times_cooked ?? 0) > 0 && (
                      <span className="text-[11px] bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded-full">🍳 {r.times_cooked}×</span>
                    )}
                    {r.calories_per_serving && (
                      <button
                        onClick={(ev) => handleAteIt(r, ev)}
                        className="ml-auto text-[11px] px-3 py-1 rounded-full border border-blush/40 text-blush hover:bg-blush hover:text-charcoal transition"
                        title="Registrar consumo de hoje"
                      >
                        + Comi isso
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-border rounded-3xl">
            <div className="text-5xl mb-4">🍽️</div>
            <h3 className="font-display text-2xl text-cream mb-2">
              {filter === "favoritas" ? "Nenhuma receita favoritada ainda" : "Sua coleção está vazia"}
            </h3>
            <p className="text-cream/60">
              {filter === "favoritas" ? "Abra uma receita salva e clique na ★ para favoritar." : "Salve receitas da página de receitas para encontrá-las aqui."}
            </p>
          </div>
        )}
      </section>

      {selectedRecipe && (
        <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)}
          onDelete={handleDelete} onFavorite={handleFavorite} />
      )}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} />}
    </div>
  );
}
