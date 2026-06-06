# MAPA DEL CÓDIGO — CABELAB v2.0
> Guía de navegación técnica por la estructura del proyecto.

## 1. Directorio Raíz
*   `/app`: Núcleo de la aplicación (Next.js App Router).
    *   `(auth)`: Rutas de login y registro.
    *   `(dashboard)`: Rutas protegidas con Sidebar/Navbar. Incluye `/pizarra`, `/taller`, `/equipos`, e `/historial`.
    *   `api/`: Endpoints backend que consumen el `WorkflowEngine`.
*   `/supabase/migrations`: La inteligencia del sistema a nivel de datos.
    *   `001_user_profiles.sql`: Define roles (enum) y perfiles vinculados a Auth.
    *   `002_workflow.sql`: Tablas de estados y transiciones permitidas.
    *   `003_equipment_records.sql`: Tabla principal de equipos con triggers de timestamps.
    *   `004_status_history.sql`: Log de auditoría para cambios de estado.
    *   `005_rls_policies.sql`: Definición de todas las políticas de seguridad por rol.
    *   `006_seed_workflow.sql`: Carga los 8 estados iniciales y sus transiciones legales.

## 2. Componentes Estratégicos (`/components`)
*   `layout/Sidebar.tsx`: Gestiona la navegación dinámica basada en el rol del usuario (`SIDEBAR_ITEMS_BY_ROLE`).
*   `pizarra/PizarraBoard.tsx`: Tablero principal con lógica de columnas por estado.
*   `equipment/EquipmentDetail.tsx`: Vista 360° del equipo, incluye el historial cronológico.
*   `equipment/StatusChangeModal.tsx`: Componente crítico que consulta las transiciones permitidas antes de mostrar opciones de cambio de estado.

## 3. Lógica y Utilidades (`/lib`)
*   `supabase/server.ts` y `client.ts`: Configuradores del cliente Supabase para SSR y Client components respectivamente.
*   `workflow/engine.ts`: Contiene la clase `WorkflowEngine` que valida transiciones y maneja los "force-status" del Superadmin.
*   `validations/`: Esquemas de Zod para asegurar que los datos de equipos y usuarios sean correctos antes de entrar a la BD.

## 4. Hooks Personalizados (`/hooks`)
*   `useUser.ts`: Expone el usuario actual, su perfil y, lo más importante, su **rol** simplificado.
*   `useRealtimePizarra.ts`: Maneja la suscripción vía WebSockets a la tabla `equipment_records`. Si algo cambia en la BD, la UI se actualiza instantáneamente.
*   `useEquipmentList.ts`: SWR hook para fetching y cacheo eficiente de listas de equipos.

## 5. Archivos de Configuración
*   `package.json`: Define el stack Next.js 16 + React 19.
*   `middleware.ts`: Protege todas las rutas. Verifica sesión activa y si el usuario está aprobado (`is_active`).
*   `tailwind.config.ts`: Define la paleta de colores personalizada (`bg-base`, `neon-blue`, `text-primary`).
