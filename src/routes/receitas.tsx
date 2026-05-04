import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import recipe1 from "@/assets/recipe-1.jpg";
import recipe2 from "@/assets/recipe-2.jpg";
import recipe3 from "@/assets/recipe-3.jpg";
import recipe4 from "@/assets/recipe-4.jpg";
import recipe5 from "@/assets/recipe-5.jpg";
import recipe6 from "@/assets/recipe-6.jpg";
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
        content:
          "Descubra receitas personalizadas com base nos ingredientes da sua despensa. Inteligência artificial, zero desperdício.",
      },
    ],
  }),
});

const CATEGORY_FILTERS = ["todas", "prato principal", "massa", "salada", "sobremesa", "pães"];
const DIET_FILTERS = ["vegano", "vegetariano", "sem glúten", "low carb"];
const COVER_IMAGES = [recipe1, recipe2, recipe3, recipe4, recipe5, recipe6];

type Nutrition = { calories: number; protein: number; carbs: number; fat: number };

type Recipe = {
  id: string;
  title: string;
  description: string;
  category: string;
  time: string;
  time_minutes: number;
  difficulty: string;
  diet: string[];
  servings: number;
  ingredients: string[];
  instructions: string;
  nutrition?: Nutrition;
  image: string;
};

// ─── Modal de detalhes da receita ────────────────────────────────────────────
function RecipeModal({
  recipe,
  onClose,
  onSave,
  saving,
  saved,
}: {
  recipe: Recipe;
  onClose: () => void;
  onSave: (r: Recipe) => void;
  saving: boolean;
  saved: boolean;
}) {
  const [servings, setServings] = useState(recipe.servings ?? 4);
  const ratio = servings / (recipe.servings ?? 4);

  // Fecha com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Escala a quantidade numérica de um ingrediente pelo ratio de porções
  function scaleIngredient(text: string): string {
    return text.replace(/(\d+[\d.,/]*)/g, (match) => {
      const num = parseFloat(match.replace(",", "."));
      if (isNaN(num)) return match;
      const scaled = num * ratio;
      return scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 bg-charcoal border border-border rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagem de capa */}
        <div className="relative h-56 overflow-hidden rounded-t-3xl md:rounded-t-3xl">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-charcoal/80 text-cream hover:bg-charcoal transition text-lg"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {recipe.diet?.map((d) => (
                <span key={d} className="text-[10px] uppercase tracking-wider bg-blush/20 text-blush px-2 py-0.5 rounded-full">
                  {d}
                </span>
              ))}
            </div>
            <h2 className="font-display text-3xl text-cream leading-tight">{recipe.title}</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="flex gap-4 text-sm text-cream/60">
            <span>⏱ {recipe.time}</span>
            <span>📊 {recipe.difficulty}</span>
            <span>🍽 {recipe.category}</span>
          </div>

          <p className="text-cream/70 text-sm leading-relaxed">{recipe.description}</p>

          {/* Ajuste de porções */}
          <div className="bg-charcoal-light border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-cream/70">Porções</span>
              <span className="text-sm font-medium text-cream">{servings}</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="w-full accent-[#C97B84]"
            />
            <div className="flex justify-between text-[10px] text-cream/40 mt-1">
              <span>1</span><span>6</span><span>12</span>
            </div>
          </div>

          {/* Ingredientes */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-blush mb-3">Ingredientes</h3>
            <ul className="space-y-2">
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-cream/80">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blush/60 flex-shrink-0" />
                  {scaleIngredient(ing)}
                </li>
              ))}
            </ul>
          </div>

          {/* Modo de preparo */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-blush mb-3">Modo de preparo</h3>
            <div className="text-sm text-cream/80 leading-relaxed whitespace-pre-line space-y-2">
              {recipe.instructions?.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          {/* Tabela nutricional */}
          {recipe.nutrition && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-blush mb-3">
                Informação nutricional <span className="text-cream/40 normal-case">(por porção, estimativa via IA)</span>
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Calorias", value: Math.round(recipe.nutrition.calories * ratio), unit: "kcal" },
                  { label: "Proteínas", value: Math.round(recipe.nutrition.protein * ratio), unit: "g" },
                  { label: "Carboidratos", value: Math.round(recipe.nutrition.carbs * ratio), unit: "g" },
                  { label: "Gorduras", value: Math.round(recipe.nutrition.fat * ratio), unit: "g" },
                ].map((n) => (
                  <div key={n.label} className="bg-charcoal-light border border-border rounded-xl p-3 text-center">
                    <div className="text-lg font-display text-cream">{n.value}</div>
                    <div className="text-[10px] text-cream/50">{n.unit}</div>
                    <div className="text-[10px] text-cream/40 mt-0.5">{n.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão salvar */}
          <button
            onClick={() => onSave(recipe)}
            disabled={saving || saved}
            className={`w-full py-3 rounded-full text-sm font-medium transition ${
              saved
                ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                : "bg-blush text-charcoal hover:bg-blush-deep disabled:opacity-60"
            }`}
          >
            {saved ? "✓ Salva em minhas receitas!" : saving ? "Salvando…" : "Salvar em minhas receitas"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card da receita ──────────────────────────────────────────────────────────
function RecipeCard({
  recipe,
  pantry,
  onOpen,
}: {
  recipe: Recipe;
  pantry: string[];
  onOpen: (r: Recipe) => void;
}) {
  const pantryMatch = pantry.filter((p) =>
    recipe.ingredients?.some((ing) => ing.toLowerCase().includes(p.toLowerCase()))
  ).length;
  const totalIngredients = recipe.ingredients?.length ?? 0;
  const matchPct = totalIngredients > 0 ? Math.round((pantryMatch / totalIngredients) * 100) : 0;

  return (
    <article
      onClick={() => onOpen(recipe)}
      className="group cursor-pointer bg-charcoal-light rounded-2xl overflow-hidden border border-border hover:border-blush/40 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
        {pantry.length > 0 && (
          <div className="absolute top-3 right-3 bg-charcoal/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-blush">
            {matchPct}% na despensa
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {recipe.diet?.slice(0, 2).map((d) => (
            <span key={d} className="text-[9px] uppercase tracking-wider bg-blush/20 text-blush px-2 py-0.5 rounded-full">
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="p-5">
        <div className="text-xs uppercase tracking-widest text-blush/80 mb-1">{recipe.category} · {recipe.time}</div>
        <h3 className="font-display text-xl text-cream leading-tight mb-2 group-hover:text-blush transition-colors">
          {recipe.title}
        </h3>
        <p className="text-sm text-cream/60 line-clamp-2">{recipe.description}</p>
      </div>
    </article>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
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

  // Carrega despensa do usuário logado
  useEffect(() => {
    if (!session) { setPantry([]); return; }
    void (async () => {
      const { data } = await supabase.from("pantry_items").select("name").eq("user_id", session.user.id);
      setPantry((data ?? []).map((r) => r.name));
    })();
  }, [session]);

  // Gera receitas via Edge Function
  async function loadRecipes(category: string, diets: string[]) {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-recipes", {
        body: { category, diet: diets, ingredients: pantry, search },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const generated: Omit<Recipe, "image">[] = data?.recipes ?? [];
      const withImages: Recipe[] = generated.map((r, i) => ({
        ...r,
        image: COVER_IMAGES[i % COVER_IMAGES.length],
      }));
      setRecipes(withImages);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Erro ao carregar receitas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRecipes(activeCategory, activeDiets); }, [activeCategory, activeDiets]);

  function toggleDiet(diet: string) {
    setActiveDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  }

  // Salva receita na tabela user_recipes do Supabase
  async function handleSave(recipe: Recipe) {
    if (!session) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("user_recipes").insert({
        user_id: session.user.id,
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        time_minutes: recipe.time_minutes,
        difficulty: recipe.difficulty,
        diet: recipe.diet,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        is_favorite: false,
      });
      if (!error) setSavedIds((prev) => new Set(prev).add(recipe.id));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600&display=swap" />
      <AppHeader />

      {isGuest && (
        <div className="bg-blush/10 border-b border-blush/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center gap-4 flex-wrap">
            <span className="text-sm text-cream/80">
              👋 Você está navegando como visitante. Crie uma conta para salvar receitas e gerenciar sua despensa.
            </span>
            <Link to="/cadastro" className="ml-auto px-4 py-1.5 rounded-full bg-blush text-charcoal text-xs font-medium hover:bg-blush-deep transition">
              criar conta
            </Link>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blush/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blush/30 bg-blush/5 text-xs text-blush mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-blush animate-pulse" />
              IA gerando receitas em tempo real
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-cream">
              Hoje você pode cozinhar<br />
              <em className="text-blush font-display italic">
                {loading ? "…" : `${filtered.length} receitas`}
              </em>{" "}
              sem ir ao mercado.
            </h1>
            <p className="mt-6 text-lg text-cream/70 max-w-2xl leading-relaxed">
              Sugestões personalizadas geradas por IA. Substitua ingredientes, ajuste porções e cozinhe sem desperdiçar nada.
            </p>
          </div>

          {/* Busca e filtros */}
          <div className="mt-12 space-y-4">
            <div className="relative max-w-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/40">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar receita, ingrediente ou categoria…"
                className="w-full bg-charcoal-light border border-border rounded-full pl-14 pr-6 py-4 text-cream placeholder:text-cream/40 focus:outline-none focus:border-blush/50 focus:ring-2 focus:ring-blush/20 transition"
              />
            </div>

            {/* Filtros de categoria */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveCategory(f)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition border ${
                    activeCategory === f
                      ? "bg-blush text-charcoal border-blush"
                      : "bg-transparent text-cream/70 border-border hover:border-blush/40 hover:text-cream"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Filtros de dieta — agora funcionais! */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-cream/40 uppercase tracking-wider">dieta:</span>
              {DIET_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleDiet(f)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition border ${
                    activeDiets.includes(f)
                      ? "bg-blush/20 text-blush border-blush/50"
                      : "bg-transparent text-cream/60 border-border hover:text-blush hover:border-blush/40"
                  }`}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={() => loadRecipes(activeCategory, activeDiets)}
                disabled={loading}
                className="ml-auto px-4 py-2 rounded-full text-sm border border-blush/40 text-blush hover:bg-blush hover:text-charcoal transition disabled:opacity-50"
              >
                {loading ? "Gerando…" : "↻ Gerar novas"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* GRID DE RECEITAS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-3xl text-cream">
            <em className="italic text-blush">sugestões</em> para você
          </h2>
          <span className="text-sm text-cream/60">
            {loading ? "carregando…" : `${filtered.length} receitas encontradas`}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-charcoal-light border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <RecipeCard key={r.id} recipe={r} pantry={pantry} onOpen={setSelectedRecipe} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && !error && (
          <div className="text-center py-20 text-cream/50">
            Nenhuma receita encontrada. Tente outro filtro.
          </div>
        )}
      </section>

      {/* Modal de detalhes */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onSave={handleSave}
          saving={saving}
          saved={savedIds.has(selectedRecipe.id)}
        />
      )}
    </div>
  );
}
