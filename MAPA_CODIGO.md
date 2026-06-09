# MAPA DEL CÓDIGO — CABELAB v2.0
> Guía de navegación técnica actualizada tras la implementación de fases, prioridades e informes.

## 1. Directorio Raíz y API
*   `/app/(auth)`: Gestión de login y registro con correos virtuales `@cabelab.local`.
*   `/app/api/equipment/[id]/update-status`: Lógica central de cambio de estado. Ahora captura el `report_number` y gestiona la asignación múltiple de técnicos.
*   `/app/api/equipment/create`: Endpoint de registro con soporte para el flag `is_priority`.
*   `/supabase/migrations`:
    *   `008_phase_tracking.sql`: Implementa columnas de hitos temporales y lógica de cálculo de días por fases.
    *   `009_priority_and_sorting.sql`: Añade soporte para el sistema de prioridades VIP y actualiza la vista principal.

## 2. Componentes de UI (`/components`)
*   `equipment/EquipmentDetail.tsx`: Ficha detallada con visualización de **Seguimiento por Fases** y badges de **Prioridad VIP**.
*   `equipment/EquipmentForm.tsx`: Formulario de registro con toggle para prioridad VIP y validación Zod sincronizada.
*   `equipment/StatusChangeModal.tsx`: Interfaz de cambio de estado que solicita obligatoriamente el **Número de Informe** en transiciones críticas.
*   `pizarra/PizarraCard.tsx`: Tarjetas del tablero con indicadores visuales de prioridad VIP (brillo púrpura y estrella).
*   `equipment/EquipmentTable.tsx`: Tabla de gestión con ordenamiento optimizado y resaltado de equipos prioritarios.

## 3. Lógica y Validación (`/lib`)
*   `validations/equipment.schema.ts`: Esquemas Zod que validan la prioridad VIP (`is_priority`) y el número de informe (`report_number`).
*   `workflow/engine.ts`: Validador de transiciones y estados administrativos.

## 4. Hooks y Estado (`/hooks`)
*   `useRealtimePizarra.ts`: Suscripción Realtime a `equipment_records`. Incluye lógica de ordenamiento en cliente por Prioridad (1°) y FR Descendente (2°).
*   `useEquipmentList.ts`: Gestión de caché y fetching de datos para las listas paginadas.

## 5. Base de Datos y Vistas
*   `equipment_with_status`: Vista central que une equipos con estados, técnicos y calcula dinámicamente:
    *   `days_elapsed`: Días totales.
    *   `phase_1_days`, `phase_2_days`, `phase_3_days`: Duración específica de cada etapa operativa.
    *   `assigned_technicians`: Nombres del personal a cargo.
