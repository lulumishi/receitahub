import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useState } from "react";

export const Route = createFileRoute("/minha-despensa")({
  component: PantryPage,
  head: () => ({
    meta: [
      { title: "Minha despensa — receitahub" },
      {
        name: "description",
        content:
          "Gerencie seu estoque de ingredientes, controle datas de validade e evite o desperdício.",
      },
    ],
  }),
});

type Item = {
  id: string;
  name: string;
  category: string;
  quantity: string;
  expiresIn: number; // days
};

const initialItems: Item[] = [
  { id: "1", name: "Arroz arbóreo", category: "Grãos", quantity: "500 g", expiresIn: 180 },
  { id: "2", name: "Cogumelos paris", category: "Vegetais", quantity: "200 g", expiresIn: 3 },
  { id: "3", name: "Tomate italiano", category: "Vegetais", quantity: "6 un", expiresIn: 5 },
  { id: "4", name: "Manjericão fresco", category: "Ervas", quantity: "1 maço", expiresIn: 2 },
  { id: "5", name: "Parmesão", category: "Laticínios", quantity: "150 g", expiresIn: 30 },
  { id: "6", name: "Azeite extra virgem", category: "Óleos", quantity: "500 ml", expiresIn: 365 },
  { id: "7", name: "Frango inteiro", category: "Proteínas", quantity: "1.2 kg", expiresIn: 1 },
  { id: "8", name: "Limão siciliano", category: "Frutas", quantity: "4 un", expiresIn: 14 },
  { id: "9", name: "Alecrim", category: "Ervas", quantity: "1 maço", expiresIn: 7 },
  { id: "10", name: "Farinha de trigo", category: "Grãos", quantity: "1 kg", expiresIn: 90 },
];

function PantryPage() {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Grãos", quantity: "", expiresIn: 7 });

  const categories = ["todos", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = filter === "todos" ? items : items.filter((i) => i.category === filter);

  const expiring = items.filter((i) => i.expiresIn <= 5).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    setItems([
      ...items,
      { id: String(Date.now()), ...newItem, expiresIn: Number(newItem.expiresIn) },
    ]);
    setNewItem({ name: "", category: "Grãos", quantity: "", expiresIn: 7 });
    setShowForm(false);
  };

  const handleRemove = (id: string) => setItems(items.filter((i) => i.id !== id));

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600&display=swap"
      />
      <AppHeader />

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-12">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-blush mb-3">seu estoque</div>
            <h1 className="text-5xl md:text-6xl text-cream leading-tight">
              minha <em className="text-blush font-display italic">despensa</em>
            </h1>
            <p className="mt-4 text-cream/70 max-w-xl">
              Tudo que você tem em casa, organizado. A IA usa esta lista para sugerir receitas
              personalizadas.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 rounded-full bg-blush text-charcoal text-sm font-medium hover:bg-blush-deep transition flex items-center gap-2"
          >
            <span className="text-lg leading-none">{showForm ? "×" : "+"}</span>
            {showForm ? "Cancelar" : "Adicionar item"}
          </button>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-charcoal-light rounded-2xl p-5 border border-border">
            <div className="text-xs uppercase tracking-wider text-cream/50">Itens totais</div>
            <div className="font-display text-3xl text-cream mt-2">{items.length}</div>
          </div>
          <div className="bg-charcoal-light rounded-2xl p-5 border border-border">
            <div className="text-xs uppercase tracking-wider text-cream/50">Categorias</div>
            <div className="font-display text-3xl text-cream mt-2">{categories.length - 1}</div>
          </div>
          <div className="bg-blush/10 rounded-2xl p-5 border border-blush/30">
            <div className="text-xs uppercase tracking-wider text-blush">Vencendo em breve</div>
            <div className="font-display text-3xl text-blush mt-2">{expiring}</div>
          </div>
          <div className="bg-charcoal-light rounded-2xl p-5 border border-border">
            <div className="text-xs uppercase tracking-wider text-cream/50">Receitas possíveis</div>
            <div className="font-display text-3xl text-cream mt-2">6</div>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <form
            onSubmit={handleAdd}
            className="mt-8 bg-charcoal-light border border-blush/30 rounded-2xl p-6 grid md:grid-cols-5 gap-4"
          >
            <input
              required
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Ingrediente"
              className="md:col-span-2 bg-charcoal border border-border rounded-xl px-4 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-blush/50"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="bg-charcoal border border-border rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-blush/50"
            >
              {["Grãos", "Vegetais", "Frutas", "Proteínas", "Laticínios", "Ervas", "Óleos", "Outros"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
            <input
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              placeholder="Quantidade"
              className="bg-charcoal border border-border rounded-xl px-4 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-blush/50"
            />
            <button
              type="submit"
              className="bg-blush text-charcoal font-medium rounded-xl px-4 py-3 hover:bg-blush-deep transition"
            >
              Adicionar
            </button>
          </form>
        )}

        {/* Category filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition border ${
                filter === c
                  ? "bg-blush text-charcoal border-blush"
                  : "border-border text-cream/70 hover:text-cream hover:border-blush/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Items table */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="bg-charcoal-light border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs uppercase tracking-wider text-cream/50 border-b border-border">
            <div className="col-span-5">Item</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Quantidade</div>
            <div className="col-span-2">Validade</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>

          {filtered.map((item) => {
            const urgent = item.expiresIn <= 3;
            const warning = item.expiresIn <= 7 && !urgent;
            return (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 px-6 py-5 items-center border-b border-border last:border-0 hover:bg-charcoal/50 transition group"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      urgent ? "bg-blush animate-pulse" : warning ? "bg-blush/50" : "bg-cream/20"
                    }`}
                  />
                  <span className="text-cream">{item.name}</span>
                </div>
                <div className="col-span-2 text-sm text-cream/60">{item.category}</div>
                <div className="col-span-2 text-sm text-cream/80">{item.quantity}</div>
                <div className="col-span-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      urgent
                        ? "bg-blush/20 text-blush border border-blush/30"
                        : warning
                          ? "bg-blush/10 text-blush/80"
                          : "text-cream/50"
                    }`}
                  >
                    {item.expiresIn === 1
                      ? "amanhã"
                      : item.expiresIn <= 30
                        ? `${item.expiresIn} dias`
                        : `${Math.round(item.expiresIn / 30)} meses`}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-cream/50 hover:text-blush transition text-sm"
                    aria-label="Remover"
                  >
                    remover
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-cream/50">
              Nenhum item nesta categoria.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
