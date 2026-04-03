
CREATE OR REPLACE FUNCTION public.remove_member(_actor_id uuid, _target_id uuid, _company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_role app_role;
  _target_role app_role;
  _is_founder boolean;
BEGIN
  -- Check if actor is a founder (can remove anyone)
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _actor_id AND role = 'founder') INTO _is_founder;
  
  IF NOT _is_founder THEN
    SELECT role INTO _actor_role FROM profiles WHERE user_id = _actor_id AND company_id = _company_id;
    IF _actor_role IS NULL THEN
      RAISE EXCEPTION 'Você não pertence a esta empresa';
    END IF;
  END IF;

  SELECT role INTO _target_role FROM profiles WHERE user_id = _target_id AND company_id = _company_id;
  IF _target_role IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado nesta empresa';
  END IF;

  -- Founder can remove anyone
  IF _is_founder THEN
    UPDATE profiles SET company_id = NULL, role = NULL WHERE user_id = _target_id;
    DELETE FROM user_roles WHERE user_id = _target_id;
    RETURN;
  END IF;

  -- Owner can remove managers and employees
  IF _actor_role = 'owner' AND _target_role IN ('manager', 'employee') THEN
    UPDATE profiles SET company_id = NULL, role = NULL WHERE user_id = _target_id;
    DELETE FROM user_roles WHERE user_id = _target_id;
    RETURN;
  END IF;

  -- Manager can remove only employees
  IF _actor_role = 'manager' AND _target_role = 'employee' THEN
    UPDATE profiles SET company_id = NULL, role = NULL WHERE user_id = _target_id;
    DELETE FROM user_roles WHERE user_id = _target_id;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Você não tem permissão para remover este usuário';
END;
$$;
