# CONTEXTO GENERAL — CABELAB v2.0
> Sistema de gestión y seguimiento operativo en tiempo real para mantenimiento de motosoldadoras.

## 1. Visión y Propósito
CABELAB v2.0 es una plataforma integral diseñada para digitalizar y automatizar el flujo de trabajo del taller. Su objetivo principal es eliminar la recarga manual de datos y proporcionar visibilidad total mediante una **Pizarra Virtual** sincronizada en tiempo real que funciona como un tablero de vuelos de aeropuerto.

## 2. Stack Tecnológico (Core)
*   **Framework:** Next.js 16.2.7 (App Router) — Uso intensivo de Server y Client Components.
*   **Lenguaje:** TypeScript (Tipado estricto para modelos de Equipos y Roles).
*   **Base de Datos:** PostgreSQL (vía Supabase).
*   **Autenticación:** Supabase Auth con integración de perfiles en tabla pública.
*   **Seguridad:** Row Level Security (RLS) implementado a nivel de base de datos.
*   **Estado y Realtime:** SWR (mutaciones optimistas) + Supabase Realtime (WebSockets).
*   **Estilos:** Tailwind CSS (Arquitectura de diseño oscuro/industrial con colores neón).

## 3. Arquitectura del Workflow Engine (Dinámico)
A diferencia de sistemas rígidos, el motor de flujos de CABELAB es **data-driven**:
*   **Configuración en BD:** Los estados (`workflow_states`) y las transiciones (`workflow_transitions`) se definen en tablas, permitiendo cambios de lógica sin tocar código.
*   **Automatización vía Triggers:**
    *   `track_status_timestamps`: Registra automáticamente fechas de inicio/fin de diagnóstico y mantenimiento al cambiar el `current_status_id`.
    *   `log_status_change`: Mantiene un historial inmutable (`status_history`) de cada movimiento.
    *   `handle_new_user`: Sincroniza el registro de Auth con el perfil público.
*   **Validación:** El sistema valida que el rol del usuario tenga permiso para ejecutar la transición solicitada antes de impactar la BD.

## 4. Roles y Permisos Críticos
*   **Superadmin (Venllas):** Único con acceso a `/admin`. Puede forzar cualquier estado (override), aprobar nuevos usuarios y editar el workflow. Protegido por triggers para evitar su eliminación accidental.
*   **Admin:** Gestión operativa completa pero sin permisos de infraestructura (workflow/usuarios).
*   **Operaciones:** Técnicos. Solo ven equipos en diagnóstico o mantenimiento.
*   **Recepción:** Ingreso de equipos y entrega final.
*   **Almacén:** Gestión de repuestos. Solo ven equipos esperando piezas.
*   **Visualizador:** Lectura global, orientado a clientes o gerencia.

## 5. Reglas de Negocio Inviolables
1.  **Normalización:** Todo texto técnico (FR, Marca, Modelo, Cliente) se guarda en MAYÚSCULAS.
2.  **Seguridad RLS:** Ningún usuario puede leer o escribir datos que su rol no permita, incluso si intentan usar la API directamente.
3.  **Aprobación:** Todo usuario registrado inicia como `is_active = false`. Solo el Superadmin puede activarlo.
4.  **Zona Horaria:** Forzada a `America/Lima` para reportes e historial.
