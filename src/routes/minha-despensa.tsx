import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  quantity: string | null;
  expires_in: number;
};

function PantryPage() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Grãos", quantity: "", expires_in: 7 });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !session) {
      navigate({ to: "/login" });
    }
  }, [authLoading, session, navigate]);

  // Load items
  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pantry_items")
        .select("id, name, category, quantity, expires_in")
        .order("created_at", { ascending: false });
      if (!error && data) setItems(data);
      setLoading(false);
    })();
  }, [session]);

  if (authLoading || !session) {
    return (
      <div className="min-h-screen bg-charcoal text-cream flex items-center justify-center">
        <div className="text-cream/50">carregando...</div>
      </div>
    );
  }

  const categories = ["todos", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = filter === "todos" ? items : items.filter((i) => i.category === filter);
  const expiring = items.filter((i) => i.expires_in <= 5).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    const { data, error } = await supabase
      .from("pantry_items")
      .insert({
        user_id: session.user.id,
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity || null,
        expires_in: Number(newItem.expires_in),
      })
      .select("id, name, category, quantity, expires_in")
      .single();
    if (!error && data) {
      setItems([data, ...items]);
      setNewItem({ name: "", category: "Grãos", quantity: "", expires_in: 7 });
      setShowForm(false);
    }
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("pantry_items").delete().eq("id", id);
    if (!error) setItems(items.filter((i) => i.id !== id));
  };

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
            <div className="font-display text-3xl text-cream mt-2">{Math.max(0, categories.length - 1)}</div>
          </div>
          <div className="bg-blush/10 rounded-2xl p-5 border border-blush/30">
            <div className="text-xs uppercase tracking-wider text-blush">Vencendo em breve</div>
            <div className="font-display text-3xl text-blush mt-2">{expiring}</div>
          </div>
          <div className="bg-charcoal-light rounded-2xl p-5 border border-border">
            <div className="text-xs uppercase tracking-wider text-cream/50">Receitas possíveis</div>
            <div className="font-display text-3xl text-cream mt-2">—</div>
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
        {items.length > 0 && (
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
        )}
      </section>

      {/* Items table */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        {loading ? (
          <div className="text-center py-16 text-cream/50">carregando despensa...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-3xl">
            <div className="text-5xl mb-4">🥫</div>
            <h3 className="font-display text-2xl text-cream mb-2">Sua despensa está vazia</h3>
            <p className="text-cream/60">
              Adicione seu primeiro ingrediente clicando em "Adicionar item".
            </p>
          </div>
        ) : (
          <div className="bg-charcoal-light border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs uppercase tracking-wider text-cream/50 border-b border-border">
              <div className="col-span-5">Item</div>
              <div className="col-span-2">Categoria</div>
              <div className="col-span-2">Quantidade</div>
              <div className="col-span-2">Validade</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {filtered.map((item) => {
              const urgent = item.expires_in <= 3;
              const warning = item.expires_in <= 7 && !urgent;
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
                  <div className="col-span-2 text-sm text-cream/80">{item.quantity || "—"}</div>
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
                      {item.expires_in === 1
                        ? "amanhã"
                        : item.expires_in <= 30
                          ? `${item.expires_in} dias`
                          : `${Math.round(item.expires_in / 30)} meses`}
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
        )}
      </section>
    </div>
  );
}
