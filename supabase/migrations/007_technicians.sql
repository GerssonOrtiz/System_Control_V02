-- 007_technicians.sql
-- Gestión de personal técnico y asignación múltiple a equipos

-- 1. Tabla de personal (maestro de técnicos)
CREATE TABLE public.technicians (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL, -- Sergio, Carlos, Luis, Gersson, etc.
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Insertar técnicos iniciales
INSERT INTO public.technicians (name) VALUES 
  ('Sergio'),
  ('Carlos'),
  ('Luis'),
  ('Gersson');

-- 3. Añadir columna de técnicos asignados a equipos (usamos array para simplicidad en la UI)
ALTER TABLE public.equipment_records 
ADD COLUMN assigned_technician_ids INTEGER[] DEFAULT '{}';

-- 4. Habilitar RLS para técnicos
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "technicians_select"
  ON public.technicians FOR SELECT
  USING (public.get_current_user_role() IS NOT NULL);

CREATE POLICY "technicians_write"
  ON public.technicians FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- 5. Actualizar la vista para incluir los nombres de los técnicos
DROP VIEW IF EXISTS public.equipment_with_status;
CREATE VIEW public.equipment_with_status AS
SELECT
  er.*,
  ws.name  AS status_name,
  ws.color AS status_color,
  ws.is_terminal,
  -- Técnico de diagnóstico (legacy support)
  dp.username AS diagnosis_tech_username,
  -- Técnico de mantenimiento (legacy support)
  mp.username AS maintenance_tech_username,
  -- Días transcurridos desde ingreso
  EXTRACT(DAY FROM NOW() - er.date_in)::INTEGER AS days_elapsed,
  -- Nombres de técnicos asignados (array de texto)
  (SELECT array_agg(t.name) 
   FROM public.technicians t 
   WHERE t.id = ANY(er.assigned_technician_ids)) AS assigned_technicians
FROM public.equipment_records er
JOIN public.workflow_states ws ON ws.id = er.current_status_id
LEFT JOIN public.user_profiles dp ON dp.id = er.diagnosis_tech_id
LEFT JOIN public.user_profiles mp ON mp.id = er.maintenance_tech_id;
