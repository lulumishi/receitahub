import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FREE_CHAT_DAILY_LIMIT, planAtLeast, type PlanTier } from "@/lib/plans";

type SubscriptionContextValue = {
  tier: PlanTier;
  status: "active" | "canceled" | "expired";
  currentPeriodEnd: string | null;
  loading: boolean;
  chatUsedToday: number;
  chatLimit: number | null;
  chatRemaining: number | null;
  canChat: boolean;
  hasPhotoRecognition: boolean;
  hasDietPlans: boolean;
  refresh: () => Promise<void>;
  registerChatMessage: () => Promise<void>;
  changePlan: (tier: PlanTier) => Promise<boolean>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<PlanTier>("free");
  const [status, setStatus] = useState<"active" | "canceled" | "expired">("active");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [chatUsedToday, setChatUsedToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setTier("free");
      setStatus("active");
      setCurrentPeriodEnd(null);
      setChatUsedToday(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: sub }, { data: usage }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan_tier, status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("chat_usage")
        .select("message_count")
        .eq("user_id", user.id)
        .eq("reference_date", today())
        .maybeSingle(),
    ]);

    if (sub) {
      setTier(sub.status === "active" ? (sub.plan_tier as PlanTier) : "free");
      setStatus(sub.status as "active" | "canceled" | "expired");
      setCurrentPeriodEnd(sub.current_period_end);
    } else {
      // usuário antigo sem registro: cria plano gratuito
      await supabase.from("subscriptions").insert({ user_id: user.id, plan_tier: "free" });
      setTier("free");
    }
    setChatUsedToday(usage?.message_count ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const registerChatMessage = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.rpc("increment_chat_usage");
    if (!error && typeof data === "number") setChatUsedToday(data);
    else setChatUsedToday((n) => n + 1);
  }, [user]);

  const changePlan = useCallback(
    async (next: PlanTier) => {
      if (!user) return false;
      const periodEnd =
        next === "free" ? null : new Date(Date.now() + 30 * 864e5).toISOString();
      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: user.id,
          plan_tier: next,
          status: "active",
          current_period_end: periodEnd,
        },
        { onConflict: "user_id" },
      );
      if (error) {
        console.error("changePlan", error);
        return false;
      }
      setTier(next);
      setStatus("active");
      setCurrentPeriodEnd(periodEnd);
      return true;
    },
    [user],
  );

  const chatLimit = tier === "free" ? FREE_CHAT_DAILY_LIMIT : null;
  const chatRemaining = chatLimit === null ? null : Math.max(0, chatLimit - chatUsedToday);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        status,
        currentPeriodEnd,
        loading,
        chatUsedToday,
        chatLimit,
        chatRemaining,
        canChat: chatRemaining === null || chatRemaining > 0,
        hasPhotoRecognition: planAtLeast(tier, "basico"),
        hasDietPlans: planAtLeast(tier, "premium"),
        refresh,
        registerChatMessage,
        changePlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used inside SubscriptionProvider");
  return ctx;
}
