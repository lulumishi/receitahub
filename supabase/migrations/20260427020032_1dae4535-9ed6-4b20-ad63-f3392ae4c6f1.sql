-- Add purchase date and expiration date columns to pantry_items
ALTER TABLE public.pantry_items
  ADD COLUMN IF NOT EXISTS purchased_at DATE,
  ADD COLUMN IF NOT EXISTS expires_at DATE;