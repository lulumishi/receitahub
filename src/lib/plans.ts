export type PlanTier = "free" | "basico" | "premium";

export const FREE_CHAT_DAILY_LIMIT = 5;

export type PlanDefinition = {
  tier: PlanTier;
  name: string;
  price: string;
  priceNote: string;
  tagline: string;
  emoji: string;
  highlight?: boolean;
  features: { label: string; included: boolean }[];
};

export const PLANS: PlanDefinition[] = [
  {
    tier: "free",
    name: "gratuito",
    price: "R$ 0",
    priceNote: "para sempre",
    tagline: "para começar a cozinhar sem desperdício",
    emoji: "🌱",
    features: [
      { label: "Despensa virtual com alertas de validade", included: true },
      { label: "Lista de compras automática", included: true },
      { label: "Receitas geradas por IA", included: true },
      { label: `Chef Despensa: ${FREE_CHAT_DAILY_LIMIT} mensagens por dia`, included: true },
      { label: "Reconhecimento de ingredientes por foto", included: false },
      { label: "Planos de dieta personalizados", included: false },
    ],
  },
  {
    tier: "basico",
    name: "básico",
    price: "R$ 14,90",
    priceNote: "por mês",
    tagline: "para quem conversa muito com o chef",
    emoji: "🍳",
    highlight: true,
    features: [
      { label: "Tudo do plano gratuito", included: true },
      { label: "Chef Despensa ilimitado", included: true },
      { label: "Reconhecimento de ingredientes por foto", included: true },
      { label: "Receita instantânea a partir da foto", included: true },
      { label: "Planos de dieta personalizados", included: false },
    ],
  },
  {
    tier: "premium",
    name: "premium",
    price: "R$ 29,90",
    priceNote: "por mês",
    tagline: "para quem quer um cardápio sob medida",
    emoji: "✨",
    features: [
      { label: "Tudo do plano básico", included: true },
      { label: "Planos de dieta personalizados por IA", included: true },
      { label: "Cardápio semanal com calorias por refeição", included: true },
      { label: "Restrições alimentares e objetivos", included: true },
      { label: "Histórico de planos salvos", included: true },
    ],
  },
];

export const PLAN_LABEL: Record<PlanTier, string> = {
  free: "gratuito",
  basico: "básico",
  premium: "premium",
};

export const PLAN_EMOJI: Record<PlanTier, string> = {
  free: "🌱",
  basico: "🍳",
  premium: "✨",
};

const RANK: Record<PlanTier, number> = { free: 0, basico: 1, premium: 2 };

export function planAtLeast(tier: PlanTier, minimum: PlanTier) {
  return RANK[tier] >= RANK[minimum];
}
