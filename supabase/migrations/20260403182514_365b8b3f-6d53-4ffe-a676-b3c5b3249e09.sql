
-- Task status enum
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.member_tier AS ENUM ('Líder', 'Influente', 'Promessa');
CREATE TYPE public.member_turno AS ENUM ('Diurno', 'Noturno', 'Integral');

-- Teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  manager_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members (employee records, not necessarily auth users)
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  tier member_tier NOT NULL DEFAULT 'Promessa',
  ovr integer NOT NULL DEFAULT 50,
  morale integer NOT NULL DEFAULT 70,
  turno member_turno NOT NULL DEFAULT 'Diurno',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  assigned_to uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS: Teams
CREATE POLICY "Founders full access on teams" ON public.teams
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'founder'))
  WITH CHECK (has_role(auth.uid(), 'founder'));

CREATE POLICY "Managers can view own teams" ON public.teams
  FOR SELECT TO authenticated
  USING (manager_id = auth.uid());

CREATE POLICY "Managers can update own teams" ON public.teams
  FOR UPDATE TO authenticated
  USING (manager_id = auth.uid())
  WITH CHECK (manager_id = auth.uid());

-- RLS: Team members
CREATE POLICY "Founders full access on team_members" ON public.team_members
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'founder'))
  WITH CHECK (has_role(auth.uid(), 'founder'));

CREATE POLICY "Managers can manage own team members" ON public.team_members
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_members.team_id AND teams.manager_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_members.team_id AND teams.manager_id = auth.uid())
  );

-- RLS: Tasks
CREATE POLICY "Founders full access on tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'founder'))
  WITH CHECK (has_role(auth.uid(), 'founder'));

CREATE POLICY "Managers can manage own team tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = tasks.team_id AND teams.manager_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = tasks.team_id AND teams.manager_id = auth.uid())
  );
