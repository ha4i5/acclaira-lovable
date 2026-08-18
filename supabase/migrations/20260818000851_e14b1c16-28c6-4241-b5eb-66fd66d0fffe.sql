-- News sources
CREATE TABLE public.news_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'rss',
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_sources TO authenticated;
GRANT ALL ON public.news_sources TO service_role;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own sources" ON public.news_sources FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Social / publishing connections
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  external_id TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  secret TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_connections TO authenticated;
GRANT ALL ON public.social_connections TO service_role;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
-- secrets are never selectable by the browser client
REVOKE SELECT (secret) ON public.social_connections FROM authenticated;
CREATE POLICY "Users manage their own connections" ON public.social_connections FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER social_connections_set_updated_at BEFORE UPDATE ON public.social_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Design templates (global library + user templates)
CREATE TABLE public.design_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout TEXT NOT NULL DEFAULT 'breaking',
  palette JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.design_templates TO authenticated;
GRANT ALL ON public.design_templates TO service_role;
ALTER TABLE public.design_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone signed in can read global templates" ON public.design_templates FOR SELECT TO authenticated
  USING (is_global OR auth.uid() = user_id);
CREATE POLICY "Users create their own templates" ON public.design_templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_global = false);
CREATE POLICY "Users update their own templates" ON public.design_templates FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their own templates" ON public.design_templates FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

INSERT INTO public.design_templates (name, description, layout, palette, is_global) VALUES
  ('Breaking Red', 'Bold red breaking-news bar with heavy caps headline.', 'breaking', '{"bg":"#14102E","accent":"#E23A3A","text":"#FFFFFF"}'::jsonb, true),
  ('Teal Wire', 'Acclaira house style: navy gradient with teal accents.', 'wire', '{"bg":"#14102E","accent":"#3EC3AC","text":"#FFFFFF"}'::jsonb, true),
  ('Bulletin Light', 'Light paper background for explainer and analysis posts.', 'bulletin', '{"bg":"#F7F6FB","accent":"#43318F","text":"#14102E"}'::jsonb, true);

-- Articles
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  meta_description TEXT,
  body_markdown TEXT NOT NULL,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  feature_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own articles" ON public.articles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER articles_set_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Publish jobs
CREATE TABLE public.publish_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  target TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  post_url TEXT,
  error TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publish_jobs TO authenticated;
GRANT ALL ON public.publish_jobs TO service_role;
ALTER TABLE public.publish_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own publish jobs" ON public.publish_jobs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Assets (images, audio, renders)
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  path TEXT NOT NULL,
  mime TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own assets" ON public.assets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- New billable module rates
INSERT INTO public.module_rates (module_key, label, credits) VALUES
  ('image', 'AI image', 3),
  ('voiceover', 'Urdu voice over', 5),
  ('publish', 'Publish to a channel', 1)
ON CONFLICT (module_key) DO NOTHING;