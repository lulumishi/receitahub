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

const CATEGORIES = [
  "Grãos",
  "Cereais",
  "Massas",
  "Frutas",
  "Vegetais",
  "Legumes",
  "Verduras",
  "Proteínas",
  "Carnes",
  "Peixes e Frutos do Mar",
  "Laticínios",
  "Ovos",
  "Pães",
  "Ervas",
  "Temperos",
  "Óleos",
  "Molhos e Condimentos",
  "Enlatados",
  "Congelados",
  "Doces e Açúcares",
  "Bebidas",
  "Snacks",
  "Outros",
];

type Item = {
  id: string;
  name: string;
  category: string;
  quantity: string | null;
  expires_in: number;
  purchased_at: string | null;
  expires_at: string | null;
};

function daysBetween(fromISO: string, toISO: string) {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISO + "T00:00:00");
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatDateBR(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function PantryPage() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Grãos",
    quantity: "",
    purchased_at: todayISO(),
    expires_at: "",
  });

  useEffect(() => {
    if (!authLoading && !session) {
      navigate({ to: "/login" });
    }
  }, [authLoading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pantry_items")
        .select("id, name, category, quantity, expires_in, purchased_at, expires_at")
        .order("created_at", { ascending: false });
      if (!error && data) setItems(data as Item[]);
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

  // "expiring" = vence em até 5 dias (usa expires_at se existir, senão expires_in)
  const today = todayISO();
  const computeDaysLeft = (item: Item): number => {
    if (item.expires_at) return daysBetween(today, item.expires_at);
    return item.expires_in;
  };
  const expiring = items.filter((i) => computeDaysLeft(i) <= 5).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    // Calcula expires_in (dias até vencer) se houver expires_at
    const expiresIn = newItem.expires_at
      ? Math.max(0, daysBetween(newItem.purchased_at || today, newItem.expires_at))
      : 7;

    const { data, error } = await supabase
      .from("pantry_items")
      .insert({
        user_id: session.user.id,
        name: newItem.name.trim(),
        category: newItem.category,
        quantity: newItem.quantity || null,
        expires_in: expiresIn,
        purchased_at: newItem.purchased_at || null,
        expires_at: newItem.expires_at || null,
      })
      .select("id, name, category, quantity, expires_in, purchased_at, expires_at")
      .single();
    if (!error && data) {
      setItems([data as Item, ...items]);
      setNewItem({
        name: "",
        category: "Grãos",
        quantity: "",
        purchased_at: todayISO(),
        expires_at: "",
      });
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
            <div className="font-display text-3xl text-cream mt-2">
              {Math.max(0, categories.length - 1)}
            </div>
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
            className="mt-8 bg-charcoal-light border border-blush/30 rounded-2xl p-6 grid md:grid-cols-6 gap-4"
          >
            <input
              required
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Ingrediente"
              maxLength={80}
              className="md:col-span-2 bg-charcoal border border-border rounded-xl px-4 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-blush/50"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="bg-charcoal border border-border rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-blush/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              placeholder="Quantidade (ex: 2kg)"
              maxLength={40}
              className="bg-charcoal border border-border rounded-xl px-4 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-blush/50"
            />
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-cream/50 px-1">
                Comprado em
              </span>
              <input
                type="date"
                value={newItem.purchased_at}
                max={todayISO()}
                onChange={(e) => setNewItem({ ...newItem, purchased_at: e.target.value })}
                className="bg-charcoal border border-border rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-blush/50"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-cream/50 px-1">
                Validade
              </span>
              <input
                type="date"
                value={newItem.expires_at}
                min={newItem.purchased_at || todayISO()}
                onChange={(e) => setNewItem({ ...newItem, expires_at: e.target.value })}
                className="bg-charcoal border border-border rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-blush/50"
              />
            </label>
            <button
              type="submit"
              className="md:col-span-6 bg-blush text-charcoal font-medium rounded-xl px-4 py-3 hover:bg-blush-deep transition"
            >
              Adicionar à despensa
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
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-xs uppercase tracking-wider text-cream/50 border-b border-border">
              <div className="col-span-3">Item</div>
              <div className="col-span-2">Categoria</div>
              <div className="col-span-2">Quantidade</div>
              <div className="col-span-2">Comprado</div>
              <div className="col-span-2">Validade</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {filtered.map((item) => {
              const daysLeft = computeDaysLeft(item);
              const expired = daysLeft < 0;
              const urgent = !expired && daysLeft <= 3;
              const warning = !expired && !urgent && daysLeft <= 7;

              const validityLabel = expired
                ? `vencido há ${Math.abs(daysLeft)}d`
                : daysLeft === 0
                  ? "vence hoje"
                  : daysLeft === 1
                    ? "amanhã"
                    : daysLeft <= 30
                      ? `${daysLeft} dias`
                      : `${Math.round(daysLeft / 30)} meses`;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-5 items-center border-b border-border last:border-0 hover:bg-charcoal/50 transition group"
                >
                  <div className="col-span-2 md:col-span-3 flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        expired
                          ? "bg-red-500"
                          : urgent
                            ? "bg-blush animate-pulse"
                            : warning
                              ? "bg-blush/50"
                              : "bg-cream/20"
                      }`}
                    />
                    <span className="text-cream">{item.name}</span>
                  </div>
                  <div className="md:col-span-2 text-sm text-cream/60">{item.category}</div>
                  <div className="md:col-span-2 text-sm text-cream/80">
                    {item.quantity || "—"}
                  </div>
                  <div className="md:col-span-2 text-sm text-cream/60">
                    {formatDateBR(item.purchased_at)}
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <span className="text-xs text-cream/50">{formatDateBR(item.expires_at)}</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full self-start ${
                        expired
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : urgent
                            ? "bg-blush/20 text-blush border border-blush/30"
                            : warning
                              ? "bg-blush/10 text-blush/80"
                              : "text-cream/50"
                      }`}
                    >
                      {validityLabel}
                    </span>
                  </div>
                  <div className="col-span-2 md:col-span-1 text-right">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="md:opacity-0 md:group-hover:opacity-100 text-cream/50 hover:text-blush transition text-sm"
                      aria-label="Remover"
                    >
                      remover
                    </button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-cream/50">Nenhum item nesta categoria.</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
