# MAPA DEL CÓDIGO — CABELAB v2.0
> Guía de navegación técnica actualizada tras la implementación de DNA, estadísticas por empresa y controles de Superadmin.

## 1. Directorio Raíz y API
*   `/app/(auth)`: Gestión de login con correos virtuales `@cabelab.local`.
*   `/app/api/equipment/[id]/update`: Endpoint maestro de actualización. Permite a Superadmins editar todos los campos, incluyendo timestamps operativos.
*   `/app/api/equipment/serial/[serial]`: Nueva API para el módulo DNA. Recupera el historial clínico completo de una máquina por su número de serie único.
*   `/app/api/stats`: Endpoint de analíticas globales, ahora con agregación por empresa (marcas, modelos y entradas recientes).
*   `/supabase/migrations`:
    *   `006_seed_workflow.sql`: Define el flujo operativo, incluyendo el nuevo estado "Coordinación con el cliente".

## 2. Componentes de UI (`/components`)
*   `equipment/EquipmentDetail.tsx`: Ficha detallada con inputs de fecha/hora para Superadmin y enlace directo al DNA del equipo.
*   `pizarra/PizarraBoard.tsx`: Tablero Realtime con la pestaña plegable horizontal de **Coordinación con el cliente** (Color Indigo Soft).
*   `dashboard/DashboardPage.tsx`: Panel principal con buscador global (FR/Cliente) y métricas rápidas.
*   `estadisticas/EstadisticasPage.tsx`: Módulo de análisis por empresa con listas de clientes, marcas preferentes y modelos recurrentes.
*   `dna/DNAPage.tsx`: Interfaz de Lifecycle Tracker con línea de tiempo histórica por máquina.

## 3. Lógica y Validación (`/lib`)
*   `permissions.ts`: Define las reglas de acceso, permitiendo al Superadmin realizar overrides y ediciones críticas.
*   `validations/equipment.schema.ts`: Esquemas Zod para integridad de datos.

## 4. Hooks y Estado (`/hooks`)
*   `useRealtimePizarra.ts`: Suscripción Realtime. Maneja el agrupamiento por estados para las columnas de la pizarra.
*   `useEquipmentList.ts`: Hooks personalizados para fetching de equipos y estadísticas del dashboard.

## 5. Base de Datos y Vistas
*   `equipment_with_status`: Vista central que expone todos los metadatos operativos, calculando:
    *   `days_elapsed`: Tiempo total en taller.
    *   `phase_1_days`, `phase_2_days`, `phase_3_days`: Hitos operativos automáticos.
    *   `assigned_technicians`: Personal asignado vía tabla `technicians`.
