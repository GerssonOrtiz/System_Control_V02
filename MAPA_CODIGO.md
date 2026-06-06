# MAPA DEL CÓDIGO — CABELAB v2.0
> Guía de navegación técnica actualizada tras la optimización del sistema de técnicos.

## 1. Directorio Raíz y API
*   `/app/(auth)`: `login` y `register` ahora generan y resuelven correos virtuales `@cabelab.local` automáticamente.
*   `/app/api/admin/technicians`: Endpoints CRUD para que el Superadmin gestione el catálogo de técnicos y practicantes.
*   `/app/api/equipment/[id]/update-status`: Lógica central de cambio de estado. Ahora maneja la asignación múltiple de técnicos (`assigned_technician_ids`).
*   `/supabase/migrations`:
    *   `001-006`: Infraestructura base y workflow inicial.
    *   `007_technicians.sql`: (Actualizado) Crea la tabla maestro de técnicos y limpia la tabla `equipment_records` de columnas legacy (`diagnosis_tech_id`, etc.).

## 2. Componentes de UI (`/components`)
*   `admin/TechnicianManager.tsx`: Panel de control para añadir o desactivar personal técnico.
*   `equipment/EquipmentForm.tsx`: Registro de equipos sin autocompletado de caché y con selector de marca inteligente (datalist).
*   `equipment/EquipmentDetail.tsx`: Ficha detallada que muestra a todos los técnicos asignados como etiquetas neón.
*   `equipment/StatusChangeModal.tsx`: Interfaz de cambio de estado con selector de técnicos mediante etiquetas de selección múltiple.
*   `pizarra/PizarraCard.tsx`: Tarjetas del tablero que muestran en miniatura el cliente, equipo y técnicos a cargo.

## 3. Lógica y Validación (`/lib`)
*   `validations/user.schema.ts`: Esquemas para login por username y registro con email opcional.
*   `validations/equipment.schema.ts`: Esquemas optimizados que requieren estrictamente el array de técnicos en las fases operativas.
*   `workflow/engine.ts`: Validador de transiciones y estados administrativos.

## 4. Hooks y Estado (`/hooks`)
*   `useUser.ts`: Provee el perfil y rol del usuario logueado.
*   `useRealtimePizarra.ts`: Suscripción en tiempo real a cambios en equipos para actualización instantánea del tablero.
*   `useEquipmentList.ts`: Gestión de caché y fetching de datos de equipos.
