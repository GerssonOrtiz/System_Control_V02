# MAPA DEL CÓDIGO — CABELAB v2.0
> Guía de navegación técnica actualizada tras la implementación de DNA, estadísticas por empresa, controles de Superadmin y el nuevo Selector de Clientes.

## 1. Directorio Raíz y API
*   `/app/(auth)`: Gestión de login con correos virtuales `@cabelab.local`.
*   `/app/api/clients`: **[NUEVO]** Endpoint para obtener nombres únicos de clientes.
*   `/app/api/equipment/[id]/update`: Endpoint maestro de actualización. Permite a Superadmins editar todos los campos, incluyendo timestamps operativos.
*   `/app/api/equipment/serial/[serial]`: API para el módulo DNA. Recupera el historial clínico completo de una máquina por su número de serie único.
*   `/app/api/stats`: Endpoint de analíticas globales, con agregación por empresa (marcas, modelos y entradas recientes).
*   `/app/admin/catalog`: Interfaz maestra de gestión del Catálogo Técnico (Repuestos/Marcas/Modelos).

## 2. Componentes de UI (`/components`)
*   `admin/BrandModelManager.tsx`: Gestión normalizada de Marcas y Modelos.
*   `admin/PartManager.tsx`: Editor de repuestos con selector de compatibilidad múltiple.
*   `equipment/ClientSelector.tsx`: **[NUEVO]** Componente de búsqueda y registro de clientes con UI neón e integración con react-hook-form.
*   `equipment/EquipmentDetail.tsx`: Ficha detallada con inputs de fecha/hora para Superadmin y enlace directo al DNA del equipo.
*   `equipment/EquipmentForm.tsx`: Formulario de registro (integra `ClientSelector`).
*   `equipment/EquipmentTable.tsx`: Lista general optimizada (columna 'Días' removida para limpieza visual).
*   `pizarra/PizarraBoard.tsx`: Tablero Realtime con la pestaña plegable horizontal de **Coordinación con el cliente**.
*   `pizarra/PizarraCard.tsx`: Tarjetas compactas con indicadores de prioridad VIP.
*   `dashboard/DashboardPage.tsx`: Panel principal con buscador global y métricas rápidas (sin tabla de equipos críticos).

## 3. Lógica y Validación (`/lib`)
*   `permissions.ts`: Define las reglas de acceso, permitiendo al Superadmin realizar overrides y ediciones críticas.
*   `validations/equipment.schema.ts`: Esquemas Zod para integridad de datos.

## 4. Hooks y Estado (`/hooks`)
*   `useRealtimePizarra.ts`: Hook central para sincronización vía WebSockets y agrupamiento por estados.
*   `useEquipmentList.ts`: Hooks personalizados para fetching de equipos y estadísticas del dashboard.

## 5. Base de Datos y Vistas
*   `supabase/migrations`: Historial de cambios en el esquema de la base de datos (001 al 010).
*   `equipment_with_status`: Vista central que expone todos los metadatos operativos, calculando:
    *   `days_elapsed`: Tiempo total en taller.
    *   `phase_1_days`, `phase_2_days`, `phase_3_days`: Hitos operativos automáticos.
    *   `assigned_technicians`: Personal asignado vía tabla `technicians`.

## 6. Dependencias Clave
*   `lucide-react`: Sistema de iconos para la interfaz neón.
*   `react-hook-form` + `@hookform/resolvers`: Manejo avanzado de formularios.
*   `sonner`: Sistema de notificaciones (Toasts).
*   `swr`: Mutación y re-validación de datos en el cliente.
