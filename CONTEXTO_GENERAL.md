# CONTEXTO GENERAL — CABELAB v2.0
> Sistema de gestión y seguimiento operativo en tiempo real para mantenimiento de motosoldadoras.

## 1. Visión y Propósito
CABELAB v2.0 es una plataforma integral diseñada para digitalizar y automatizar el flujo de trabajo del taller. Su objetivo principal es eliminar la recarga manual de datos y proporcionar visibilidad total mediante una **Pizarra Virtual** sincronizada en tiempo real.

## 2. Stack Tecnológico (Core)
*   **Framework:** Next.js 16.2.7 (App Router).
*   **Lenguaje:** TypeScript (Tipado estricto para modelos de Equipos y Roles).
*   **Base de Datos:** PostgreSQL (vía Supabase).
*   **Autenticación:** Supabase Auth optimizado para **Login por Nombre de Usuario**.
*   **Seguridad:** Row Level Security (RLS) a nivel de base de datos.
*   **Estado y Realtime:** SWR + Supabase Realtime (WebSockets).
*   **Estilos:** Tailwind CSS (Arquitectura industrial/neón).

## 3. Arquitectura del Workflow Engine
*   **Motor Dinámico:** Los estados y transiciones se definen en tablas (`workflow_states`, `workflow_transitions`).
*   **Estados Administrativos:** Existen estados especiales (**REVISION**, **PRESTAMO**) fuera del flujo normal, accesibles solo por el Superadmin mediante la función "Force Status".
*   **Gestión de Técnicos:** Sistema de **Asignación Múltiple**. Un equipo puede tener varios técnicos a cargo (ej: Sergio y Luis). Los nombres se gestionan en una tabla maestra independiente (`technicians`).

## 4. Roles y Autenticación
*   **Login Transparente:** Los usuarios entran con su nombre de usuario. Internamente, el sistema gestiona un correo virtual (`usuario@cabelab.local`) para Supabase Auth.
*   **Superadmin (Venllas):** Gestión total de usuarios, workflow y catálogo de personal técnico (incluyendo practicantes).
*   **Operaciones/Almacen/Recepcion:** Permisos restringidos según la fase del equipo.

## 5. Reglas de Negocio Críticas
1.  **Ingreso Flexible:** El FR permite números y signos (ej: 1199-1). Autocompletado de marcas sugeridas (ESAB, MILLER, etc.) pero permite ingreso libre.
2.  **Seguridad RLS:** Bloqueo total de lectura/escritura no autorizada.
3.  **Audit Log:** Cada cambio de estado genera un registro inmutable en `status_history`.
4.  **Optimización:** El sistema de técnicos legacy (UUIDs) fue eliminado y reemplazado por un sistema de arrays de IDs numéricos para mayor velocidad.
