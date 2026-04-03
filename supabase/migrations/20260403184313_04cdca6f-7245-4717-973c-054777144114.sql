
-- Profiles table: stores role and company_id for each user
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  role public.app_role,
  company_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own profile (but not role — enforced by app logic)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Founders can see all profiles
CREATE POLICY "Founders can manage all profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'founder'))
  WITH CHECK (public.has_role(auth.uid(), 'founder'));

-- Owners can see profiles in their company
CREATE POLICY "Owners can view company profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'owner'
    )
  );

-- Invites table
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  email text NOT NULL,
  role public.app_role NOT NULL,
  company_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used boolean NOT NULL DEFAULT false,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Owners can manage invites for their company
CREATE POLICY "Owners can manage own company invites" ON public.invites
  FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'owner'
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'owner'
    )
  );

-- Founders can manage all invites
CREATE POLICY "Founders can manage all invites" ON public.invites
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'founder'))
  WITH CHECK (public.has_role(auth.uid(), 'founder'));

-- Anyone can read invites by token (for invite validation before auth)
CREATE POLICY "Anyone can read invite by token" ON public.invites
  FOR SELECT TO anon, authenticated
  USING (true);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
