import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { RecipeCard } from "@/components/RecipeCard";
import { recipes } from "@/data/recipes";

export const Route = createFileRoute("/minhas-receitas")({
  component: MyRecipesPage,
  head: () => ({
    meta: [
      { title: "Minhas receitas — receitahub" },
      {
        name: "description",
        content: "Suas receitas favoritas, salvas e organizadas em um só lugar.",
      },
    ],
  }),
});

function MyRecipesPage() {
  const saved = recipes.filter((r) => r.saved);

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600&display=swap"
      />
      <AppHeader />

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-blush mb-3">
              sua coleção
            </div>
            <h1 className="text-5xl md:text-6xl text-cream leading-tight">
              minhas <em className="text-blush font-display italic">receitas</em>
            </h1>
            <p className="mt-4 text-cream/70 max-w-xl">
              Tudo que você salvou para preparar depois. Organize, edite e cozinhe quando der
              vontade.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-3 rounded-full border border-border text-sm hover:border-blush/40 transition">
              Importar receita
            </button>
            <button className="px-5 py-3 rounded-full bg-blush text-charcoal text-sm font-medium hover:bg-blush-deep transition">
              + Nova receita
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Salvas", v: saved.length },
            { l: "Criadas por você", v: 0 },
            { l: "Já preparadas", v: 12 },
            { l: "Favoritas", v: saved.length },
          ].map((s) => (
            <div
              key={s.l}
              className="bg-charcoal-light rounded-2xl p-5 border border-border"
            >
              <div className="text-xs uppercase tracking-wider text-cream/50">{s.l}</div>
              <div className="font-display text-3xl text-cream mt-2">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        {saved.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-border rounded-3xl">
            <div className="text-5xl mb-4">🍽️</div>
            <h3 className="font-display text-2xl text-cream mb-2">
              Sua coleção está vazia
            </h3>
            <p className="text-cream/60">
              Salve receitas da página principal para encontrá-las aqui.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
