
-- Fix invites policies that also reference profiles
DROP POLICY IF EXISTS "Owners can manage own company invites" ON public.invites;

CREATE POLICY "Owners can manage own company invites" ON public.invites
  FOR ALL TO authenticated
  USING (
    company_id = public.get_user_company_id(auth.uid())
  )
  WITH CHECK (
    company_id = public.get_user_company_id(auth.uid())
  );
