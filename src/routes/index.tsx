import { createFileRoute } from "@tanstack/react-router";
import heroImage from "@/assets/hero-pantry.jpg";
import recipeImage from "@/assets/recipe-feature.jpg";
import aiIcon from "@/assets/ai-icon.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Despensa Virtual — Gestão inteligente com IA" },
      {
        name: "description",
        content:
          "Sistema web que organiza sua despensa, evita o desperdício e sugere receitas personalizadas com IA. Projeto Integrador II — CEUB.",
      },
      { property: "og:title", content: "Despensa Virtual — Gestão com IA" },
      {
        property: "og:description",
        content:
          "Organize seus mantimentos, reduza o desperdício e descubra receitas adaptadas ao que você já tem em casa.",
      },
    ],
  }),
});

const features = [
  {
    n: "01",
    title: "Inventário Automatizado",
    desc: "Controle rigoroso do seu estoque com monitoramento inteligente de datas de validade.",
  },
  {
    n: "02",
    title: "Substituição Inteligente",
    desc: "A IA sugere ingredientes alternativos quando algo está faltando — você cozinha com o que tem.",
  },
  {
    n: "03",
    title: "Porções Dinâmicas",
    desc: "Ajuste o número de porções e o sistema recalcula automaticamente o consumo da despensa.",
  },
  {
    n: "04",
    title: "Restrições Alimentares",
    desc: "Filtros para vegano, sem glúten, low carb e mais — sua dieta sempre respeitada.",
  },
  {
    n: "05",
    title: "Análise Nutricional",
    desc: "Tabelas nutricionais geradas via IA para cada receita, ajudando no monitoramento da saúde.",
  },
  {
    n: "06",
    title: "Lista de Compras",
    desc: "Geração automática da lista do que falta — uma ida ao mercado sem esquecimentos.",
  },
];

const stories = [
  { id: "US01", txt: "Cadastrar e logar para salvar minha despensa", tag: "Alta" },
  { id: "US02", txt: "Adicionar e remover itens da despensa", tag: "Alta" },
  { id: "US04", txt: "Receber sugestões de receitas baseadas no estoque", tag: "Alta" },
  { id: "US08", txt: "IA sugere substitutos para itens faltantes", tag: "Alta" },
  { id: "US05", txt: "Gerar lista de compras automática", tag: "Alta" },
  { id: "US03", txt: "Dashboard de economia financeira", tag: "Média" },
  { id: "US06", txt: "Ver tabela nutricional via IA", tag: "Média" },
  { id: "US07", txt: "Filtrar receitas por restrição alimentar", tag: "Média" },
  { id: "US09", txt: "Ajustar número de porções", tag: "Média" },
  { id: "US10", txt: "Filtrar por tempo de preparo", tag: "Baixa" },
];

const sprints = [
  { n: 1, t: "Requisitos & Visão" },
  { n: 2, t: "Backlog & Priorização" },
  { n: 3, t: "Modelagem do Banco" },
  { n: 4, t: "Back-end Base" },
  { n: 5, t: "Front-end Base" },
  { n: 6, t: "CRUD Despensa" },
  { n: 7, t: "Dashboard" },
  { n: 8, t: "Integração IA" },
  { n: 9, t: "Testes & Ajustes" },
  { n: 10, t: "Apresentação Final" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap"
      />

      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blush" />
            <span className="font-display text-xl tracking-tight">Despensa Virtual</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#sobre" className="hover:text-foreground transition">Sobre</a>
            <a href="#funcionalidades" className="hover:text-foreground transition">Funcionalidades</a>
            <a href="#backlog" className="hover:text-foreground transition">Backlog</a>
            <a href="#cronograma" className="hover:text-foreground transition">Cronograma</a>
          </nav>
          <a
            href="#sobre"
            className="hidden md:inline-flex items-center gap-2 bg-charcoal text-cream px-4 py-2 rounded-full text-sm hover:opacity-90 transition"
          >
            Conhecer o projeto →
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-soft border border-blush/40 text-xs uppercase tracking-widest text-charcoal mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-blush" />
              Projeto Integrador II · CEUB
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-charcoal">
              Sua despensa,
              <br />
              <em className="text-blush not-italic font-display italic">com inteligência</em>
              <br />
              de chef.
            </h1>
            <p className="mt-8 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Um sistema web que cruza o que você tem em casa com um motor de IA, transformando
              ingredientes esquecidos em receitas personalizadas — e cortando o desperdício alimentar
              de uma vez por todas.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#funcionalidades"
                className="inline-flex items-center gap-2 bg-charcoal text-cream px-7 py-3.5 rounded-full text-sm font-medium hover:translate-y-[-2px] transition"
              >
                Ver funcionalidades
              </a>
              <a
                href="#sobre"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium border border-charcoal/20 hover:bg-blush-soft transition"
              >
                Sobre o projeto
              </a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <div className="font-display text-3xl text-charcoal">10</div>
                <div className="text-xs text-muted-foreground mt-1">Sprints</div>
              </div>
              <div>
                <div className="font-display text-3xl text-charcoal">14</div>
                <div className="text-xs text-muted-foreground mt-1">Itens de backlog</div>
              </div>
              <div>
                <div className="font-display text-3xl text-charcoal">IA</div>
                <div className="text-xs text-muted-foreground mt-1">Integrada</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-6 bg-blush/30 rounded-[3rem] blur-3xl" />
            <div className="relative rounded-[2rem] overflow-hidden border border-blush/40 shadow-[0_30px_80px_-30px_rgba(232,193,197,0.7)]">
              <img
                src={heroImage}
                alt="Despensa organizada com ingredientes frescos sobre fundo blush"
                width={1600}
                height={1200}
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-cream border border-border rounded-2xl p-5 shadow-xl max-w-[260px] hidden md:block">
              <div className="flex items-center gap-3">
                <img src={aiIcon} alt="IA" width={40} height={40} className="h-10 w-10" />
                <div>
                  <div className="text-xs text-muted-foreground">IA sugeriu</div>
                  <div className="text-sm font-medium text-charcoal">Risoto de cogumelos</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                100% dos ingredientes na sua despensa.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / SOBRE */}
      <section id="sobre" className="py-24 lg:py-32 bg-charcoal text-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="text-xs uppercase tracking-widest text-blush mb-4">O problema</div>
              <h2 className="text-4xl md:text-5xl text-cream leading-tight">
                Comida que vence.
                <br />
                Dinheiro que escapa.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6 space-y-6 text-cream/80 text-lg leading-relaxed">
              <p>
                Estudantes e jovens adultos que moram sozinhos enfrentam dificuldade para gerenciar
                mantimentos. O resultado: alimentos jogados fora por vencimento e itens comprados em
                duplicidade no mercado.
              </p>
              <p>
                Existe ainda uma lacuna entre os ingredientes disponíveis na geladeira e o
                conhecimento para transformá-los em refeições — gerando gastos excessivos com
                delivery e pouca variedade na rotina.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-cream/10">
                <div>
                  <div className="font-display text-4xl text-blush">30%</div>
                  <div className="text-sm text-cream/60 mt-1">dos alimentos comprados acabam descartados</div>
                </div>
                <div>
                  <div className="font-display text-4xl text-blush">R$ 800+</div>
                  <div className="text-sm text-cream/60 mt-1">de economia anual potencial por pessoa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-16">
            <div className="text-xs uppercase tracking-widest text-charcoal/60 mb-4">Funcionalidades</div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-charcoal leading-tight">
              Uma despensa que
              <em className="text-blush not-italic font-display italic"> pensa </em>
              por você.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden border border-border">
            {features.map((f) => (
              <div
                key={f.n}
                className="group bg-cream p-10 hover:bg-blush-soft transition-colors duration-500"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="font-display text-3xl text-blush">{f.n}</span>
                  <span className="h-2 w-2 rounded-full bg-charcoal/20 group-hover:bg-blush transition" />
                </div>
                <h3 className="text-2xl text-charcoal mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT FEATURE */}
      <section className="py-24 lg:py-32 bg-blush-soft/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="text-xs uppercase tracking-widest text-charcoal/60 mb-4">Inteligência adaptativa</div>
            <h2 className="text-4xl md:text-5xl text-charcoal leading-tight mb-6">
              Da geladeira
              <br />
              ao prato — em
              <em className="text-blush not-italic font-display italic"> minutos.</em>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              O motor de recomendação cruza seu estoque real com restrições, tempo e complexidade.
              Quando falta um ingrediente, a IA propõe substitutos coerentes e recalcula porções
              automaticamente.
            </p>
            <ul className="space-y-4">
              {[
                "Filtros por restrição alimentar e tempo de preparo",
                "Substituição inteligente de ingredientes",
                "Dimensionamento dinâmico de porções",
                "Tabela nutricional automática via IA",
              ].map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blush flex-shrink-0" />
                  <span className="text-charcoal">{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="rounded-[2rem] overflow-hidden border border-blush/30">
              <img
                src={recipeImage}
                alt="Receita preparada com ingredientes da despensa"
                width={1200}
                height={1400}
                loading="lazy"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BACKLOG */}
      <section id="backlog" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-5">
              <div className="text-xs uppercase tracking-widest text-charcoal/60 mb-4">Backlog do produto</div>
              <h2 className="text-4xl md:text-5xl text-charcoal leading-tight">
                Cada user story,
                <br />
                um passo mais perto.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 text-muted-foreground text-lg leading-relaxed">
              O backlog reúne 10 user stories e 4 features técnicas, priorizadas e distribuídas ao
              longo de 10 sprints. A entrega é incremental — cada sprint adiciona valor visível ao
              usuário final.
            </div>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-cream">
            {stories.map((s, i) => (
              <div
                key={s.id}
                className={`grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-blush-soft/40 transition ${
                  i !== stories.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="col-span-2 md:col-span-1 font-mono text-xs text-charcoal/60">
                  {s.id}
                </div>
                <div className="col-span-7 md:col-span-9 text-charcoal">{s.txt}</div>
                <div className="col-span-3 md:col-span-2 flex justify-end">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      s.tag === "Alta"
                        ? "bg-charcoal text-cream"
                        : s.tag === "Média"
                          ? "bg-blush text-charcoal"
                          : "bg-blush-soft text-charcoal/70"
                    }`}
                  >
                    {s.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRONOGRAMA */}
      <section id="cronograma" className="py-24 lg:py-32 bg-charcoal text-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-6">
              <div className="text-xs uppercase tracking-widest text-blush mb-4">Cronograma</div>
              <h2 className="text-4xl md:text-5xl text-cream leading-tight">
                10 sprints,
                <br />
                uma entrega contínua.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 text-cream/70 text-lg leading-relaxed">
              Da modelagem do banco à integração da IA, cada sprint tem foco e resultado mensurável.
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {sprints.map((s) => (
              <div
                key={s.n}
                className="group relative p-6 rounded-2xl border border-cream/10 hover:border-blush hover:bg-blush/5 transition"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest text-cream/40">Sprint</span>
                  <span className="font-display text-3xl text-blush">{s.n}</span>
                </div>
                <div className="text-cream text-sm leading-snug">{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl text-charcoal leading-[1.05]">
            Menos desperdício.
            <br />
            <em className="text-blush not-italic font-display italic">Mais sabor.</em>
          </h2>
          <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto">
            Um projeto acadêmico que une banco de dados, full-stack e IA generativa para resolver
            um problema real do dia a dia.
          </p>
          <div className="mt-10 inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-4 rounded-full">
            <span className="h-2 w-2 rounded-full bg-blush animate-pulse" />
            Em desenvolvimento — Sprint atual em andamento
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-blush" />
              <span className="font-display text-xl text-charcoal">Despensa Virtual</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sistema Web de Gestão de Despensa e Sugestão de Receitas com IA.
            </p>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="text-charcoal font-medium mb-2">Projeto</div>
            <div>Projeto Integrador II</div>
            <div>Ciência da Computação · 6° semestre</div>
            <div>CEUB — Brasília, DF</div>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="text-charcoal font-medium mb-2">Autoria</div>
            <div>Luísa de Moura Zimmer</div>
            <div className="pt-3 text-xs text-charcoal/40">© 2026 — Todos os direitos reservados</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
