
-- Function: transfer ownership atomically
CREATE OR REPLACE FUNCTION public.transfer_ownership(_current_owner_id uuid, _new_owner_id uuid, _company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify current user is actually the owner of this company
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = _current_owner_id AND role = 'owner' AND company_id = _company_id
  ) THEN
    RAISE EXCEPTION 'Você não é o dono desta empresa';
  END IF;

  -- Verify target is a manager in the same company
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = _new_owner_id AND role = 'manager' AND company_id = _company_id
  ) THEN
    RAISE EXCEPTION 'O usuário selecionado não é um gerente desta empresa';
  END IF;

  -- Swap roles atomically
  UPDATE profiles SET role = 'manager' WHERE user_id = _current_owner_id AND company_id = _company_id;
  UPDATE profiles SET role = 'owner' WHERE user_id = _new_owner_id AND company_id = _company_id;

  -- Update user_roles table for backward compat
  UPDATE user_roles SET role = 'manager' WHERE user_id = _current_owner_id;
  UPDATE user_roles SET role = 'owner' WHERE user_id = _new_owner_id;
END;
$$;

-- Function: remove member from company
CREATE OR REPLACE FUNCTION public.remove_member(_actor_id uuid, _target_id uuid, _company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_role app_role;
  _target_role app_role;
BEGIN
  SELECT role INTO _actor_role FROM profiles WHERE user_id = _actor_id AND company_id = _company_id;
  SELECT role INTO _target_role FROM profiles WHERE user_id = _target_id AND company_id = _company_id;

  IF _actor_role IS NULL THEN
    RAISE EXCEPTION 'Você não pertence a esta empresa';
  END IF;

  IF _target_role IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado nesta empresa';
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
