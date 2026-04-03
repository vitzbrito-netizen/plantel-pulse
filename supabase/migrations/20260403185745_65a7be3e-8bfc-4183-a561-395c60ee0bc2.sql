
-- Drop the recursive policy
DROP POLICY IF EXISTS "Owners can view company profiles" ON public.profiles;

-- Create a security definer function to get company_id without recursion
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Recreate the policy using the function
CREATE POLICY "Owners can view company profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    company_id IS NOT NULL
    AND company_id = public.get_user_company_id(auth.uid())
  );
