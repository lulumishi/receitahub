
ALTER TABLE public.user_recipes
  ADD COLUMN IF NOT EXISTS calories_per_serving integer,
  ADD COLUMN IF NOT EXISTS rating integer CHECK (rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS times_cooked integer NOT NULL DEFAULT 0;

CREATE TABLE public.calorie_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id uuid REFERENCES public.user_recipes(id) ON DELETE SET NULL,
  recipe_title text NOT NULL,
  calories integer NOT NULL,
  consumed_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.calorie_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calorie log"
  ON public.calorie_log FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own calorie log"
  ON public.calorie_log FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own calorie log"
  ON public.calorie_log FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_calorie_log_user_date ON public.calorie_log(user_id, consumed_at DESC);
