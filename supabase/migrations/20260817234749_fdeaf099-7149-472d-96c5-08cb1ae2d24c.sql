-- Pricing / module rates
CREATE TABLE public.module_rates (
  module_key text PRIMARY KEY,
  label text NOT NULL,
  credits integer NOT NULL CHECK (credits >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.module_rates TO anon, authenticated;
GRANT ALL ON public.module_rates TO service_role;
ALTER TABLE public.module_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read module rates" ON public.module_rates FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.module_rates (module_key, label, credits) VALUES
  ('post', 'Viral news post', 1),
  ('article', 'SEO article', 4),
  ('video', 'Urdu video script', 10);

-- Credit ledger
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  reason text NOT NULL,
  module_key text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transactions" ON public.credit_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX credit_tx_user_idx ON public.credit_transactions (user_id, created_at DESC);

-- Generations
CREATE TABLE public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  headline text NOT NULL,
  language text NOT NULL DEFAULT 'english',
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  credits_used integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'app',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own generations" ON public.generations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users delete own generations" ON public.generations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX generations_user_idx ON public.generations (user_id, created_at DESC);

-- API keys (hashed)
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  revoked boolean NOT NULL DEFAULT false,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own api keys" ON public.api_keys FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX api_keys_user_idx ON public.api_keys (user_id, created_at DESC);

-- Brands
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  handle text,
  accent_color text NOT NULL DEFAULT '#3EC3AC',
  watermark_text text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own brands" ON public.brands FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Atomic credit spend / refund
CREATE OR REPLACE FUNCTION public.spend_credits(_user_id uuid, _amount integer, _reason text, _module_key text, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  UPDATE public.profiles
     SET credits = credits - _amount
   WHERE id = _user_id AND credits >= _amount
   RETURNING credits INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, reason, module_key, meta)
  VALUES (_user_id, -_amount, new_balance, _reason, _module_key, _meta);

  RETURN new_balance;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text, text, jsonb) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.grant_credits(_user_id uuid, _amount integer, _reason text, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  UPDATE public.profiles SET credits = credits + _amount WHERE id = _user_id RETURNING credits INTO new_balance;
  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;
  INSERT INTO public.credit_transactions (user_id, amount, balance_after, reason, module_key, meta)
  VALUES (_user_id, _amount, new_balance, _reason, NULL, _meta);
  RETURN new_balance;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.grant_credits(uuid, integer, text, jsonb) FROM PUBLIC, anon, authenticated;