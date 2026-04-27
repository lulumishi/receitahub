import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { RecipeCard } from "@/components/RecipeCard";
import { recipes } from "@/data/recipes";
import { useState } from "react";

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

const filters = ["todas", "prato principal", "massa", "salada", "sobremesa", "pães"];
const dietFilters = ["vegano", "vegetariano", "sem glúten", "low carb"];

function RecipesPage() {
  const [active, setActive] = useState("todas");
  const [search, setSearch] = useState("");

  const filtered = recipes.filter((r) => {
    const matchCategory = active === "todas" || r.category.toLowerCase() === active;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600&display=swap"
      />
      <AppHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blush/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blush/30 bg-blush/5 text-xs text-blush mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-blush animate-pulse" />
              IA analisando sua despensa em tempo real
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-cream">
              Hoje você pode cozinhar
              <br />
              <em className="text-blush font-display italic">{recipes.length} receitas</em> sem ir
              ao mercado.
            </h1>
            <p className="mt-6 text-lg text-cream/70 max-w-2xl leading-relaxed">
              Sugestões personalizadas com base no que já está na sua despensa. Substitua
              ingredientes, ajuste porções e cozinhe sem desperdiçar nada.
            </p>
          </div>

          {/* Search & filters */}
          <div className="mt-12 space-y-6">
            <div className="relative max-w-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/40"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar receita, ingrediente ou categoria…"
                className="w-full bg-charcoal-light border border-border rounded-full pl-14 pr-6 py-4 text-cream placeholder:text-cream/40 focus:outline-none focus:border-blush/50 focus:ring-2 focus:ring-blush/20 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActive(f)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition border ${
                    active === f
                      ? "bg-blush text-charcoal border-blush"
                      : "bg-transparent text-cream/70 border-border hover:border-blush/40 hover:text-cream"
                  }`}
                >
                  {f}
                </button>
              ))}
              <span className="mx-2 h-6 w-px bg-border" />
              {dietFilters.map((f) => (
                <button
                  key={f}
                  className="px-4 py-2 rounded-full text-sm capitalize transition border border-border bg-transparent text-cream/60 hover:text-blush hover:border-blush/40"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-3xl text-cream">
            <em className="italic text-blush">sugestões</em> para você
          </h2>
          <span className="text-sm text-cream/60">{filtered.length} receitas encontradas</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-cream/50">
            Nenhuma receita encontrada. Tente outro filtro.
          </div>
        )}
      </section>
    </div>
  );
}
