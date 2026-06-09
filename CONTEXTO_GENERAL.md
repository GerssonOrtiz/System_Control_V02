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
*   **Gestión de Técnicos:** Sistema de **Asignación Múltiple**. Un equipo puede tener varios técnicos a cargo. Los nombres se gestionan en una tabla maestra independiente (`technicians`).
*   **Seguimiento de Tiempos por Fase:** El sistema mide automáticamente la duración en días de tres fases clave:
    1.  **Fase 1:** Ingreso → Pendiente de Aprobación.
    2.  **Fase 2:** Evaluación → Aprobación.
    3.  **Fase 3:** Aprobación → Entrega.

## 4. Roles y Autenticación
*   **Login Transparente:** Los usuarios entran con su nombre de usuario. Internamente, el sistema gestiona un correo virtual (`usuario@cabelab.local`) para Supabase Auth.
*   **Superadmin (Venllas):** Gestión total de usuarios, workflow y catálogo de personal técnico.
*   **Operaciones/Almacen/Recepcion:** Permisos restringidos según la fase del equipo.

## 5. Reglas de Negocio Críticas
1.  **Prioridad VIP:** Los equipos marcados como VIP tienen precedencia visual (estrellas y bordes neón púrpura) y se ordenan al inicio de todas las listas.
2.  **Ordenamiento Inteligente:** Las listas y la pizarra se ordenan por: 1° Prioridad VIP, 2° Número de Ficha (FR) descendente.
3.  **Trazabilidad de Informes:** Al finalizar un diagnóstico (pasar a Pendiente de Aprobación o Aprobado), es obligatorio ingresar el **Número de Informe**.
4.  **Audit Log:** Cada cambio de estado genera un registro inmutable en `status_history`.
5.  **Timestamps Operativos:** Triggers en DB capturan automáticamente los hitos temporales para el cálculo de indicadores de desempeño (KPIs).
