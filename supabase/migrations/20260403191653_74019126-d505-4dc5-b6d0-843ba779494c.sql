
CREATE OR REPLACE FUNCTION public.accept_invite(_user_id uuid, _token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite record;
BEGIN
  SELECT * INTO _invite FROM invites WHERE token = _token;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado';
  END IF;
  
  IF _invite.used THEN
    RAISE EXCEPTION 'Convite já utilizado';
  END IF;
  
  IF _invite.expires_at < now() THEN
    RAISE EXCEPTION 'Convite expirado';
  END IF;

  -- Update the user's profile
  UPDATE profiles 
  SET role = _invite.role, 
      company_id = _invite.company_id,
      updated_at = now()
  WHERE user_id = _user_id;

  -- Insert into user_roles for backward compat
  INSERT INTO user_roles (user_id, role) 
  VALUES (_user_id, _invite.role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Mark invite as used
  UPDATE invites 
  SET used = true, used_by = _user_id 
  WHERE id = _invite.id;
END;
$$;
