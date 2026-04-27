import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { recipes } from "@/data/recipes";
import heroImg from "@/assets/landing-hero.jpg";
import stepImg from "@/assets/landing-step.jpg";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "receitahub — cozinhe com o que você já tem" },
      {
        name: "description",
        content:
          "IA que transforma os ingredientes da sua despensa em receitas reais. Menos desperdício, mais sabor.",
      },
      { property: "og:title", content: "receitahub — cozinhe com o que você já tem" },
      {
        property: "og:description",
        content:
          "IA que transforma os ingredientes da sua despensa em receitas reais. Menos desperdício, mais sabor.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
});

const steps = [
  {
    n: "01",
    title: "Cadastre sua despensa",
    text: "Adicione o que você tem em casa em segundos — manualmente ou tirando uma foto da prateleira.",
  },
  {
    n: "02",
    title: "A IA monta o cardápio",
    text: "Receitas reais, em português, calculadas a partir dos seus ingredientes e preferências alimentares.",
  },
  {
    n: "03",
    title: "Cozinhe sem sobras",
    text: "Ajuste porções, substitua ingredientes e marque o que já usou. A despensa atualiza sozinha.",
  },
];

function LandingPage() {
  const featured = recipes.slice(0, 6);

  return (
    <div className="min-h-screen bg-charcoal text-cream overflow-x-hidden">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600&display=swap"
      />
      <AppHeader />

      {/* HERO */}
      <section className="relative">
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] bg-blush/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-20 grid lg:grid-cols-12 gap-12 items-center relative">
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blush/30 bg-blush/5 text-xs text-blush">
              <span className="h-1.5 w-1.5 rounded-full bg-blush animate-pulse" />
              cozinha inteligente, em português
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-cream">
              Cozinhe com o que <em className="font-display italic text-blush">você já tem</em> em casa.
            </h1>
            <p className="text-lg text-cream/70 max-w-xl leading-relaxed">
              O receitahub usa inteligência artificial para transformar a sua despensa em
              receitas reais, prontas em minutos. Sem listas de mercado, sem desperdício.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/receitas"
                className="group inline-flex items-center gap-2 bg-blush text-charcoal px-7 py-4 rounded-full font-medium hover:bg-blush-deep transition"
              >
                ver receitas de hoje
                <svg className="h-4 w-4 transition group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/minha-despensa"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-border text-cream/80 hover:border-blush/40 hover:text-cream transition"
              >
                cadastrar despensa
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-6 text-sm text-cream/60">
              <div>
                <div className="font-display text-2xl text-blush">{recipes.length}+</div>
                <div>receitas em português</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="font-display text-2xl text-blush">3 min</div>
                <div>para o seu primeiro prato</div>
              </div>
              <div className="hidden sm:block h-10 w-px bg-border" />
              <div className="hidden sm:block">
                <div className="font-display text-2xl text-blush">-40%</div>
                <div>desperdício de comida</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border">
              <img
                src={heroImg}
                alt="Ingredientes frescos sobre tábua de ardósia"
                width={1536}
                height={1152}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/40 via-transparent to-transparent" />
            </div>
            {/* floating card */}
            <div className="absolute -bottom-6 -left-6 bg-charcoal-light/95 backdrop-blur-xl border border-border rounded-2xl p-5 max-w-xs shadow-2xl">
              <div className="flex items-center gap-2 text-xs text-blush mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blush animate-pulse" />
                IA sugerindo agora
              </div>
              <div className="font-display text-lg text-cream leading-tight">
                Você tem ingredientes para 14 receitas hoje.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-charcoal-light/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
          <div className="max-w-2xl mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-blush mb-4">como funciona</div>
            <h2 className="text-4xl md:text-5xl text-cream leading-tight">
              Da despensa ao prato em <em className="font-display italic text-blush">três passos</em>.
            </h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-border">
                <img
                  src={stepImg}
                  alt="Despensa organizada com potes de vidro"
                  width={1080}
                  height={1440}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <ol className="lg:col-span-7 space-y-2">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="group grid grid-cols-[auto_1fr] gap-6 items-start py-8 border-b border-border last:border-b-0"
                >
                  <span className="font-display italic text-5xl text-blush/70 group-hover:text-blush transition">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-2xl text-cream mb-2">{s.title}</h3>
                    <p className="text-cream/65 leading-relaxed max-w-lg">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FEATURED RECIPES */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.2em] text-blush mb-4">em destaque</div>
            <h2 className="text-4xl md:text-5xl text-cream leading-tight">
              Receitas <em className="font-display italic text-blush">desta semana</em>.
            </h2>
          </div>
          <Link
            to="/receitas"
            className="inline-flex items-center gap-2 text-cream/80 hover:text-blush transition text-sm border-b border-border hover:border-blush pb-1"
          >
            ver todas as receitas
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {featured.map((r, i) => (
            <Link
              key={r.id}
              to="/receitas"
              className="group block"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 border border-border">
                <img
                  src={r.image}
                  alt={r.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 font-display italic text-cream/80 text-sm">
                  nº {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="text-xs uppercase tracking-widest text-blush/90 mb-1.5">
                {r.category} · {r.time} min
              </div>
              <h3 className="font-display text-2xl text-cream group-hover:text-blush transition leading-tight">
                {r.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 text-center">
          <div className="inline-block">
            <div className="text-xs uppercase tracking-[0.2em] text-blush mb-6">comece agora</div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05] max-w-4xl mx-auto">
              O que tem na sua{" "}
              <em className="font-display italic text-blush">despensa</em> hoje?
            </h2>
            <p className="mt-6 text-lg text-cream/70 max-w-xl mx-auto">
              Em menos de 3 minutos a IA descobre tudo que você pode cozinhar — sem precisar
              ir ao mercado.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/minha-despensa"
                className="group inline-flex items-center gap-2 bg-blush text-charcoal px-8 py-4 rounded-full font-medium hover:bg-blush-deep transition"
              >
                cadastrar minha despensa
                <svg className="h-4 w-4 transition group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/receitas"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-cream/80 hover:border-blush/40 hover:text-cream transition"
              >
                explorar receitas primeiro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-cream/50">
          <div className="font-display italic text-blush text-lg font-mono">receitahub</div>
          <div>© {new Date().getFullYear()} receitahub. cozinhe com inteligência.</div>
        </div>
      </footer>
    </div>
  );
}
