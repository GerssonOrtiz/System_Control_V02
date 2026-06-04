-- 006_seed_workflow.sql
-- Datos iniciales: 12 estados estandarizados + 13 transiciones del workflow

-- Estados iniciales estandarizados (en orden operativo)
INSERT INTO public.workflow_states (name, order_index, is_initial, is_terminal, color) VALUES
  ('En espera de diagnóstico',        1,  true,  false, '#00E5FF'),
  ('En diagnóstico',                  2,  false, false, '#0052FF'),
  ('En espera de repuesto',           3,  false, false, '#9D4EDD'),
  ('Pendiente de aprobación',         4,  false, false, '#F59E0B'),
  ('Repuesto entregado',              5,  false, false, '#6366F1'),
  ('Aprobado',                        6,  false, false, '#10B981'),
  ('Inicio de mantenimiento',         7,  false, false, '#0052FF'),
  ('En mantenimiento',                8,  false, false, '#0052FF'),
  ('En espera de repuesto adicional', 9,  false, false, '#9D4EDD'),
  ('Control de calidad',              10, false, false, '#F59E0B'),
  ('Servicio culminado',              11, false, false, '#10B981'),
  ('Entregado',                       12, false, true,  '#6B7280');

-- Transiciones permitidas entre estados
-- Usa subconsultas para relacionar por nombre (más legible y resistente a cambios de ID)
INSERT INTO public.workflow_transitions (from_state_id, to_state_id, allowed_roles)
SELECT f.id, t.id, roles.allowed
FROM (VALUES
  ('En espera de diagnóstico',        'En diagnóstico',                   ARRAY['operaciones','admin','superadmin']),
  ('En diagnóstico',                  'En espera de repuesto',            ARRAY['operaciones','admin','superadmin']),
  ('En diagnóstico',                  'Pendiente de aprobación',          ARRAY['operaciones','admin','superadmin']),
  ('En espera de repuesto',           'Repuesto entregado',               ARRAY['almacen','admin','superadmin']),
  ('Pendiente de aprobación',         'Aprobado',                         ARRAY['recepcion','admin','superadmin']),
  ('Repuesto entregado',              'Inicio de mantenimiento',          ARRAY['operaciones','admin','superadmin']),
  ('Aprobado',                        'Inicio de mantenimiento',          ARRAY['operaciones','admin','superadmin']),
  ('Inicio de mantenimiento',         'En mantenimiento',                 ARRAY['operaciones','admin','superadmin']),
  ('En mantenimiento',                'En espera de repuesto adicional',  ARRAY['operaciones','admin','superadmin']),
  ('En mantenimiento',                'Control de calidad',               ARRAY['operaciones','admin','superadmin']),
  ('En espera de repuesto adicional', 'Repuesto entregado',               ARRAY['almacen','admin','superadmin']),
  ('Control de calidad',              'Servicio culminado',               ARRAY['operaciones','admin','superadmin']),
  ('Servicio culminado',              'Entregado',                        ARRAY['recepcion','admin','superadmin'])
) AS roles(from_name, to_name, allowed)
JOIN public.workflow_states f ON f.name = roles.from_name
JOIN public.workflow_states t ON t.name = roles.to_name;
