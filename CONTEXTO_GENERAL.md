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
*   **Iconografía:** Lucide React (vía `lucide-react`).

## 3. Arquitectura del Workflow Engine
*   **Motor Dinámico:** Los estados y transiciones se definen en tablas (`workflow_states`, `workflow_transitions`).
*   **Coordinación con el Cliente:** Nuevo estado administrativo plegable en la pizarra, diseñado como punto de control antes de la aprobación final.
*   **Control Total (Superadmin):** Capacidad de editar manualmente cualquier timestamp operativo (ingreso, diagnóstico, mantenimiento, fases) para corregir desviaciones en KPIs.
*   **Seguimiento de Tiempos por Fase:** El sistema mide automáticamente la duración en días de tres fases clave:
    1.  **Fase 1:** Ingreso → Pendiente de Aprobación.
    2.  **Fase 2:** Evaluación → Aprobación.
    3.  **Fase 3:** Aprobación → Entrega.

## 4. Catálogo Técnico e Inteligencia
*   **Catálogo Maestro de Repuestos:** Base de datos centralizada de piezas con códigos únicos, nombres oficiales y especificaciones técnicas.
*   **Motor de Compatibilidad:** Relación inteligente entre repuestos y modelos de máquinas. El sistema filtra automáticamente qué piezas son aptas para cada equipo.
*   **Normalización de Activos:** Registro controlado de Marcas y Modelos para evitar errores de escritura y duplicidad en los datos del taller.

## 5. Gestión de Clientes y Marcas (v2.3)
*   **Selectores Inteligentes:** Implementación de componentes `ClientSelector` y `BrandSelector` con búsqueda predictiva.
*   **Auto-Registro de Catálogo:** Al registrar un equipo con una marca nueva, el sistema la inserta automáticamente en el catálogo maestro para futuras sugerencias.
*   **UI Pulida (Anti-Transparencia):** Interfaz optimizada con fondos sólidos (`bg-bg-elevated`) en todos los desplegables y filtros para máxima legibilidad.
*   **Pizarra Limpia:** Eliminación de alertas de atraso redundantes en la pizarra para reducir el ruido visual.

## 6. Roles y Autenticación
*   **Login Transparente:** Los usuarios entran con su nombre de usuario. Internamente, el sistema gestiona un correo virtual (`usuario@cabelab.local`) para Supabase Auth.
*   **Superadmin (Venllas):** Gestión total de usuarios, workflow y catálogo de personal técnico.
*   **Operaciones/Almacen/Recepcion:** Permisos restringidos según la fase del equipo.

## 7. Reglas de Negocio Críticas
1.  **DNA del Equipo (Lifecycle History):** Trazabilidad completa por **Número de Serie**. Permite ver todas las intervenciones históricas de una máquina específica a través del tiempo.
2.  **Sistema de Prioridad VIP (Niveles 1-3):** Evolución del sistema binario a tres niveles de urgencia:
    *   **VIP 1:** Prioridad básica (⭐).
    *   **VIP 2:** Prioridad intermedia (⭐⭐).
    *   **VIP 3:** Prioridad máxima (⭐⭐⭐) con efecto **Glow Pulsante** y ordenamiento superior absoluto.
3.  **Análisis por Empresa:** El dashboard administrativo incluye un menú estadístico profundo por cliente, desglosando marcas preferentes y modelos recurrentes.
4.  **Buscador Inteligente:** Sistema de búsqueda optimizado en Dashboard para localización instantánea por FR, Cliente o Serie.
5.  **Audit Log:** Cada cambio de estado genera un registro inmutable en `status_history`.
6.  **Timestamps Operativos:** Triggers en DB y controles de Superadmin capturan los hitos temporales para indicadores de desempeño (KPIs).
