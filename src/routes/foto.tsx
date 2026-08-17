import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, BookmarkPlus, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { recognizePhoto, type RecognizedPhoto } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/foto")({
  component: PhotoPage,
  head: () => ({
    meta: [
      { title: "Receita por foto — receitahub" },
      {
        name: "description",
        content:
          "Fotografe um ingrediente e a IA do receitahub identifica o que é e cria uma receita na hora.",
      },
      { property: "og:title", content: "Receita por foto — receitahub" },
      {
        property: "og:description",
        content: "Reconhecimento de ingredientes por foto com receita gerada na hora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PhotoPage() {
  const { session, loading: authLoading } = useAuth();
  const { hasPhotoRecognition, loading: subLoading, tier } = useSubscription();
  const navigate = useNavigate();
  const runRecognize = useServerFn(recognizePhoto);
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RecognizedPhoto | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/login" });
  }, [authLoading, session, navigate]);

  if (authLoading || !session || subLoading) {
    return (
      <div className="min-h-screen bg-charcoal text-cream">
        <div className="py-24 text-center text-cream/50">carregando...</div>
      </div>
    );
  }

  const handleFile = async (file: File) => {
    if (file.size > 5_000_000) {
      toast.error("Imagem muito grande (máx 5 MB).");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setPreview(dataUrl);
    setResult(null);
    setSaved(false);
    setBusy(true);
    try {
      const { data: pantry } = await supabase
        .from("pantry_items")
        .select("name")
        .eq("user_id", session.user.id);
      const recognized = await runRecognize({
        data: { image: dataUrl, pantry: (pantry ?? []).map((p) => p.name) },
      });
      setResult(recognized);
      await supabase.from("photo_recognition_requests").insert({
        user_id: session.user.id,
        recognized_item: recognized.main_item || null,
      });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Não consegui ler a foto.");
    } finally {
      setBusy(false);
    }
  };

  const saveRecipe = async () => {
    if (!result?.recipe) return;
    const r = result.recipe;
    const { error } = await supabase.from("user_recipes").insert({
      user_id: session.user.id,
      title: r.title,
      description: r.description ?? null,
      category: r.category ?? "prato principal",
      time_minutes: r.time_minutes ?? null,
      difficulty: r.difficulty ?? null,
      diet: r.diet ?? [],
      ingredients: r.ingredients ?? null,
      instructions: r.instructions ?? null,
      calories_per_serving: r.calories_per_serving ?? null,
      cost_home_brl: r.cost_home_brl ?? null,
      cost_delivery_brl: r.cost_delivery_brl ?? null,
    });
    if (error) {
      toast.error("Erro ao salvar a receita.");
      return;
    }
    setSaved(true);
    toast.success(`"${r.title}" salva em Minhas Receitas! 🎉`);
  };

  if (!hasPhotoRecognition) {
    return (
      <div className="min-h-screen bg-charcoal text-cream">
        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blush/40 bg-blush/10">
            <Lock className="text-blush" size={24} />
          </div>
          <h1 className="font-display italic text-3xl text-blush mt-6">
            recurso dos planos básico e premium
          </h1>
          <p className="text-cream/60 mt-3 leading-relaxed">
            Seu plano atual é o <span className="text-blush">{tier === "free" ? "gratuito" : tier}</span>.
            Assine o básico para fotografar ingredientes e receber receitas na hora.
          </p>
          <Link
            to="/planos"
            className="inline-block mt-8 rounded-full bg-blush px-7 py-3 text-sm text-charcoal hover:bg-blush-deep transition"
          >
            ver planos
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <main className="max-w-3xl mx-auto px-6 lg:px-10 py-14">
        <p className="text-xs uppercase tracking-[0.25em] text-cream/40">reconhecimento por foto</p>
        <h1 className="font-display italic text-4xl text-blush mt-3">
          fotografe, descubra, cozinhe 📸
        </h1>
        <p className="text-cream/60 mt-3">
          Tire uma foto de um ingrediente (ou da geladeira aberta) e a IA identifica o que é e monta
          uma receita usando o que você tem.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="mt-8 w-full rounded-2xl border border-dashed border-blush/40 bg-blush/[0.04] py-12 text-center transition hover:border-blush disabled:opacity-60"
        >
          {busy ? (
            <span className="inline-flex items-center gap-2 text-blush">
              <Loader2 className="animate-spin" size={18} /> analisando a foto...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-blush">
              <Camera size={18} /> escolher ou tirar uma foto
            </span>
          )}
        </button>

        {preview && (
          <img
            src={preview}
            alt="Foto do ingrediente enviada para análise"
            className="mt-6 max-h-72 w-full rounded-2xl object-cover border border-border"
          />
        )}

        {result && (
          <section className="mt-8 rounded-2xl border border-border bg-cream/[0.02] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cream/40">identificado</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-blush/40 px-3 py-1 text-xs text-blush"
                >
                  {item}
                </span>
              ))}
            </div>

            <h2 className="font-display italic text-2xl text-blush mt-6">{result.recipe.title}</h2>
            {result.recipe.description && (
              <p className="text-cream/65 text-sm mt-1">{result.recipe.description}</p>
            )}
            <p className="text-xs text-cream/40 mt-2">
              {[
                result.recipe.time_minutes ? `⏱ ${result.recipe.time_minutes} min` : null,
                result.recipe.difficulty ? `🎯 ${result.recipe.difficulty}` : null,
                result.recipe.calories_per_serving
                  ? `🔥 ${result.recipe.calories_per_serving} kcal`
                  : null,
              ]
                .filter(Boolean)
                .join("  ·  ")}
            </p>

            {result.recipe.ingredients?.length ? (
              <>
                <h3 className="text-sm text-cream/80 mt-6 mb-2">ingredientes</h3>
                <ul className="space-y-1 text-sm text-cream/65">
                  {result.recipe.ingredients.map((ing, i) => (
                    <li key={i}>• {ing}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {result.recipe.instructions && (
              <>
                <h3 className="text-sm text-cream/80 mt-6 mb-2">modo de preparo</h3>
                <p className="whitespace-pre-wrap text-sm text-cream/65">
                  {result.recipe.instructions}
                </p>
              </>
            )}

            <button
              onClick={saveRecipe}
              disabled={saved}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-blush px-6 py-2.5 text-sm text-charcoal transition hover:bg-blush-deep disabled:opacity-60"
            >
              <BookmarkPlus size={16} />
              {saved ? "salva em minhas receitas" : "salvar receita"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
