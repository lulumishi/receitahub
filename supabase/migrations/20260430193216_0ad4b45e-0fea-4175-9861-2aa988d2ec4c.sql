CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  quantity TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  is_purchased BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping items"
  ON public.shopping_list_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping items"
  ON public.shopping_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items"
  ON public.shopping_list_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items"
  ON public.shopping_list_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_shopping_list_items_user_purchased
  ON public.shopping_list_items (user_id, is_purchased);

CREATE TRIGGER update_shopping_list_items_updated_at
  BEFORE UPDATE ON public.shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();