import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/receitas")({
  component: RecipesPage,
  head: () => ({
    meta: [
      { title: "Receitas — receitahub" },
      {
        name: "description",
        content: "Descubra receitas personalizadas com base nos ingredientes da sua despensa. Inteligência artificial, zero desperdício.",
      },
    ],
  }),
});

const CATEGORY_FILTERS = ["todas", "prato principal", "massa", "salada", "sobremesa", "pães"];
const DIET_FILTERS = ["vegano", "vegetariano", "sem glúten", "low carb"];

// ─── DICIONÁRIO DE EMOJIS (ORDEM DE PRIORIDADE) ─────────────────────────────
const CATEGORY_STYLE: Record<string, { emoji: string; bg: string }> = {
  // 1. Especialidades Brasileiras
  "moqueca":         { emoji: "🥘", bg: "from-orange-600/30 to-amber-500/10" },
  "feijoada":        { emoji: "🍲", bg: "from-zinc-700/40 to-stone-800/20" },
  "brigadeiro":      { emoji: "🍫", bg: "from-stone-600/40 to-stone-800/20" },
  "pão de queijo":   { emoji: "🥯", bg: "from-yellow-600/30 to-amber-500/10" },
  "açaí":            { emoji: "🥣", bg: "from-purple-800/40 to-indigo-900/20" },
  "coxinha":         { emoji: "🍗", bg: "from-orange-600/30 to-yellow-500/10" },
  
  // 2. Proteínas e Pratos Mundiais
  "camarão":         { emoji: "🍤", bg: "from-orange-600/30 to-red-600/10" },
  "peixe":           { emoji: "🐟", bg: "from-cyan-700/30 to-blue-600/10" },
  "frango":          { emoji: "🍗", bg: "from-amber-600/30 to-orange-500/10" },
  "carne":           { emoji: "🥩", bg: "from-red-700/30 to-red-900/10" },
  "pizza":           { emoji: "🍕", bg: "from-red-600/30 to-yellow-500/10" },
  "bolo":            { emoji: "🍰", bg: "from-pink-600/30 to-rose-500/10" },

  // 3. Categorias Gerais
  "massa":           { emoji: "🍝", bg: "from-orange-600/30 to-red-500/10" },
  "salada":          { emoji: "🥗", bg: "from-green-600/30 to-emerald-500/10" },
  "sobremesa":       { emoji: "🍰", bg: "from-pink-600/30 to-fuchsia-500/10" },
  "pães":            { emoji: "🍞", bg: "from-yellow-600/30 to-amber-500/10" },
  "sopa":            { emoji: "🍲", bg: "from-red-700/30 to-orange-600/10" },
  "lanche":          { emoji: "🥪", bg: "from-lime-600/30 to-green-500/10" },
  "prato principal": { emoji: "🥘", bg: "from-amber-600/30 to-yellow-500/10" },
  "default":         { emoji: "🍽️", bg: "from-zinc-700/40 to-zinc-800/20" },
};

function getCategoryStyle(category: string, title: string) {
  const textToSearch = `${title} ${category}`.toLowerCase();
  const key = Object.keys(CATEGORY_STYLE).find((k) => textToSearch.includes(k));
  return CATEGORY_STYLE[key ?? "default"];
}

type Nutrition = { calories: number; protein: number; carbs: number; fat: number };

type Recipe = {
  id: string; title: string; description: string; category: string; time: string;
  time_minutes: number; difficulty: string; diet: string[]; servings: number;
  ingredients: string[]; instructions: string; nutrition?: Nutrition;
};

// ─── Capa visual corrigida (Gradientes de volta!) ───────────────────────────
function RecipeCover({ category, title, size = "card" }: { category: string; title: string; size?: "card" | "modal" }) {
  const { emoji, bg } = getCategoryStyle(category, title);
  const h = size === "modal" ? "h-56" : "aspect-[4/3]";
  return (
    <div className={`${h} w-full bg-gradient-to-br ${bg} flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 bg-charcoal/20" />
      <span className={`relative ${size === "modal" ? "text-8xl" : "text-7xl"} drop-shadow-2xl select-none`}>
        {emoji}
      </span>
    </div>
  );
}

function RecipeModal({ recipe, onClose, onSave, saving, saved }: {
  recipe: Recipe; onClose: () => void; onSave: (r: Recipe) => void; saving: boolean; saved: boolean;
}) {
  const [servings, setServings] = useState(recipe.servings ?? 4);
  const ratio = servings / (recipe.servings ?? 4);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function scaleIngredient(text: string): string {
    return text.replace(/(\d+[\d.,/]*)/g, (match) => {
      const num = parseFloat(match.replace(",", "."));
      if (isNaN(num)) return match;
      const scaled = num * ratio;
      return scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 bg-charcoal border border-border rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative rounded-t-3xl overflow-hidden">
          <RecipeCover category={recipe.category} title={recipe.title} size="modal" />
          <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-charcoal/80 text-cream hover:bg-charcoal transition text-lg">×</button>
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="font-display text-3xl text-cream leading-tight drop-shadow-lg">{recipe.title}</h2>
          </div>
        </div>
        <div className="p-6 space-y-6 text-cream">
          <div className="flex gap-4 text-sm text-cream/60">
            <span>⏱ {recipe.time}</span><span>📊 {recipe.difficulty}</span>
          </div>
          <p className="text-cream/70 text-sm">{recipe.description}</p>
          <div className="bg-charcoal-light border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Porções</span><span className="text-sm font-medium">{servings}</span>
            </div>
            <input type="range" min={1} max={12} step={1} value={servings} onChange={(e) => setServings(Number(e.target.value))} className="w-full accent-[#C97B84]" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-blush mb-3">Ingredientes</h3>
            <ul className="space-y-2 text-sm text-cream/80">
              {recipe.ingredients?.map((ing, i) => (<li key={i}>{scaleIngredient(ing)}</li>))}
            </ul>
          </div>
          <button onClick={() => onSave(recipe)} disabled={saving || saved} className={`w-full py-3 rounded-full text-sm font-medium transition ${saved ? "bg-green-500/20 text-green-400" : "bg-blush text-charcoal"}`}>
            {saved ? "✓ Salva!" : saving ? "Salvando…" : "Salvar receita"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecipeCard({ recipe, pantry, onOpen }: { recipe: Recipe; pantry: string[]; onOpen: (r: Recipe) => void }) {
  const pantryMatch = pantry.filter((p) => recipe.ingredients?.some((ing) => ing.toLowerCase().includes(p.toLowerCase()))).length;
  const matchPct = recipe.ingredients?.length > 0 ? Math.round((pantryMatch / recipe.ingredients.length) * 100) : 0;

  return (
    <article onClick={() => onOpen(recipe)} className="group cursor-pointer bg-charcoal-light rounded-2xl overflow-hidden border border-border hover:border-blush/40 transition-all">
      <div className="relative">
        <RecipeCover category={recipe.category} title={recipe.title} size="card" />
        {pantry.length > 0 && matchPct > 0 && (
          <div className="absolute top-3 right-3 bg-charcoal/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-blush">{matchPct}% na despensa</div>
        )}
      </div>
      <div className="p-5">
        <div className="text-xs uppercase tracking-widest text-blush/80 mb-1">{recipe.category}</div>
        <h3 className="font-display text-xl text-cream leading-tight mb-2 group-hover:text-blush transition-colors">{recipe.title}</h3>
      </div>
    </article>
  );
}

function RecipesPage() {
  const { session } = useAuth();
  const isGuest = !session;
  const [activeCategory, setActiveCategory] = useState("todas");
  const [activeDiets, setActiveDiets] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantry, setPantry] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) { setPantry([]); return; }
    void (async () => {
      const { data } = await supabase.from("pantry_items").select("name").eq("user_id", session.user.id);
      setPantry((data ?? []).map((r) => r.name));
    })();
  }, [session]);

  async function loadRecipes(category: string, diets: string[]) {
    setLoading(true); setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-recipes", {
        body: { category, diet: diets, ingredients: pantry, search },
      });
      if (fnError) throw fnError;
      setRecipes(data?.recipes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar receitas");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadRecipes(activeCategory, activeDiets); }, [activeCategory, activeDiets]);

  async function handleSave(recipe: Recipe) {
    if (!session) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("user_recipes").insert({
        user_id: session.user.id, title: recipe.title, description: recipe.description, category: recipe.category,
        time_minutes: recipe.time_minutes, difficulty: recipe.difficulty, diet: recipe.diet,
        ingredients: recipe.ingredients, instructions: recipe.instructions, is_favorite: false,
      });
      if (!error) setSavedIds((prev) => new Set(prev).add(recipe.id));
    } finally { setSaving(false); }
  }

  const filtered = recipes.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600&display=swap" />
      <AppHeader />
      
      {isGuest && (
        <div className="bg-blush/10 border-b border-blush/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center gap-4 flex-wrap">
            <span className="text-sm text-cream/80">👋 Visitante: crie uma conta para salvar receitas.</span>
            <Link to="/cadastro" className="ml-auto px-4 py-1.5 rounded-full bg-blush text-charcoal text-xs font-medium">criar conta</Link>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 relative">
          <h1 className="text-5xl md:text-6xl text-cream leading-tight">Hoje você pode cozinhar<br /><em className="text-blush font-display italic">{loading ? "…" : `${filtered.length} receitas`}</em> sem ir ao mercado.</h1>
          <div className="mt-12 space-y-4">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar receita..." className="w-full bg-charcoal-light border border-border rounded-full pl-6 pr-6 py-4 text-cream focus:outline-none" />
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((f) => (
                <button key={f} onClick={() => setActiveCategory(f)} className={`px-4 py-2 rounded-full text-sm transition border ${activeCategory === f ? "bg-blush text-charcoal" : "bg-transparent text-cream/70 border-border"}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        {loading ? ( <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="aspect-[4/3] rounded-2xl bg-charcoal-light animate-pulse" />))}</div> ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map((r) => (<RecipeCard key={r.id} recipe={r} pantry={pantry} onOpen={setSelectedRecipe} />))}</div>
        )}
      </section>
      {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} onSave={handleSave} saving={saving} saved={savedIds.has(selectedRecipe.id)} />}
    </div>
  );
}
