-- Enums
CREATE TYPE public.plan_tier AS ENUM ('free', 'basico', 'premium');
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'expired');

-- subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier public.plan_tier NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  payment_provider_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own subscription" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscription" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- chat_usage
CREATE TABLE public.chat_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_count integer NOT NULL DEFAULT 0,
  reference_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reference_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_usage TO authenticated;
GRANT ALL ON public.chat_usage TO service_role;
ALTER TABLE public.chat_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own chat usage" ON public.chat_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own chat usage" ON public.chat_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own chat usage" ON public.chat_usage FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_chat_usage_updated_at BEFORE UPDATE ON public.chat_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- photo_recognition_requests
CREATE TABLE public.photo_recognition_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text,
  recognized_item text,
  generated_recipe_id uuid REFERENCES public.user_recipes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photo_recognition_requests TO authenticated;
GRANT ALL ON public.photo_recognition_requests TO service_role;
ALTER TABLE public.photo_recognition_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own photo requests" ON public.photo_recognition_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own photo requests" ON public.photo_recognition_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own photo requests" ON public.photo_recognition_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- diet_plans
CREATE TABLE public.diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  objective text NOT NULL,
  restrictions text[] DEFAULT ARRAY[]::text[],
  profile_notes text,
  generated_plan jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_plans TO authenticated;
GRANT ALL ON public.diet_plans TO service_role;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own diet plans" ON public.diet_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own diet plans" ON public.diet_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own diet plans" ON public.diet_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own diet plans" ON public.diet_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_diet_plans_updated_at BEFORE UPDATE ON public.diet_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- new users start on free plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.subscriptions (user_id, plan_tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- backfill existing users
INSERT INTO public.subscriptions (user_id, plan_tier, status)
SELECT id, 'free', 'active' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- atomic daily chat counter
CREATE OR REPLACE FUNCTION public.increment_chat_usage()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  INSERT INTO public.chat_usage (user_id, reference_date, message_count)
  VALUES (auth.uid(), CURRENT_DATE, 1)
  ON CONFLICT (user_id, reference_date)
  DO UPDATE SET message_count = public.chat_usage.message_count + 1, updated_at = now()
  RETURNING message_count INTO new_count;
  RETURN new_count;
END;
$function$;
GRANT EXECUTE ON FUNCTION public.increment_chat_usage() TO authenticated;