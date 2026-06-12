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
*   **Coordinación con el Cliente:** Nuevo estado administrativo plegable en la pizarra, diseñado como punto de control antes de la aprobación final.
*   **Control Total (Superadmin):** Capacidad de editar manualmente cualquier timestamp operativo (ingreso, diagnóstico, mantenimiento, fases) para corregir desviaciones en KPIs.
*   **Seguimiento de Tiempos por Fase:** El sistema mide automáticamente la duración en días de tres fases clave:
    1.  **Fase 1:** Ingreso → Pendiente de Aprobación.
    2.  **Fase 2:** Evaluación → Aprobación.
    3.  **Fase 3:** Aprobación → Entrega.

## 4. Roles y Autenticación
*   **Login Transparente:** Los usuarios entran con su nombre de usuario. Internamente, el sistema gestiona un correo virtual (`usuario@cabelab.local`) para Supabase Auth.
*   **Superadmin (Venllas):** Gestión total de usuarios, workflow y catálogo de personal técnico.
*   **Operaciones/Almacen/Recepcion:** Permisos restringidos según la fase del equipo.

## 5. Reglas de Negocio Críticas
1.  **DNA del Equipo (Lifecycle History):** Trazabilidad completa por **Número de Serie**. Permite ver todas las intervenciones históricas de una máquina específica a través del tiempo, detectando recurrencias y garantizando la calidad.
2.  **Prioridad VIP:** Los equipos marcados como VIP tienen precedencia visual (estrellas y bordes neón púrpura) y se ordenan al inicio de todas las listas.
3.  **Análisis por Empresa:** El dashboard administrativo incluye un menú estadístico profundo por cliente, desglosando marcas preferentes, modelos recurrentes y registro de entradas recientes.
4.  **Buscador Inteligente:** Sistema de búsqueda optimizado en Dashboard para localización instantánea por FR, Cliente o Serie.
5.  **Audit Log:** Cada cambio de estado genera un registro inmutable en `status_history`.
6.  **Timestamps Operativos:** Triggers en DB y controles de Superadmin capturan los hitos temporales para el cálculo de indicadores de desempeño (KPIs).
