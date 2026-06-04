// app/(dashboard)/estadisticas/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

interface StatsData {
  total_active: number
  total_delayed: number
  delivered_this_month: number
  avg_days_to_delivery: number
  by_status: Array<{ status_name: string; count: number; color: string }>
  by_service_type: Array<{ service_type: string; count: number }>
  delayed_equipment: Array<{ fr_number: string; client_name: string; status_name: string; days_elapsed: number }>
}

export default function EstadisticasPage() {
  const { role } = useUser()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      } else {
        toast.error(data.error || 'Error al cargar estadísticas')
      }
    } catch {
      toast.error('Error de red al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const allowedRoles = ['superadmin', 'admin', 'visualizador']
    if (role && allowedRoles.includes(role)) {
      fetchStats()
    }
  }, [role])

  const allowedRoles = ['superadmin', 'admin', 'visualizador']
  if (role && !allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-2 p-6">
        <h2 className="text-xl font-extrabold uppercase text-red-500 tracking-wider">Acceso Restringido</h2>
        <p className="text-text-secondary text-sm max-w-md text-center">
          Esta sección está disponible para roles Administrativos y Visualizadores autorizados.
        </p>
      </div>
    )
  }

  if (loading || !stats) {
    return (
      <div className="text-center py-20 text-sm text-neon-blue font-mono tracking-widest animate-pulse">
        CALCULANDO ESTADÍSTICAS OPERATIVAS...
      </div>
    )
  }

  const serviceTypeLabels: Record<string, string> = {
    REVISION_GENERAL: 'Revisión General',
    MANTENIMIENTO_PREVENTIVO: 'Mant. Preventivo',
    GARANTIA_CABELAB: 'Garantía Cabelab',
    REPARACION_MAYOR: 'Reparación Mayor',
  }

  return (
    <div className="space-y-8 font-sans text-text-primary p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-widest text-neon-blue">
          📊 Reportes y Analíticas
        </h1>
        <p className="text-xs text-text-secondary uppercase tracking-wider mt-1">
          Panel de monitoreo del rendimiento y flujos de equipos del taller.
        </p>
      </div>

      {/* ─── 4 CARDS DE MÉTRICAS RÁPIDAS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Activos */}
        <div className="bg-bg-surface/50 border border-border-subtle rounded-xl p-5 hover:border-neon-blue/20 transition-all">
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">Activos en Taller</span>
          <div className="text-3xl font-extrabold text-neon-blue mt-2 font-mono">
            {stats.total_active}
          </div>
          <div className="text-[10px] text-text-muted mt-1 uppercase">Motosoldadoras en proceso</div>
        </div>

        {/* Atrasados */}
        <div className="bg-bg-surface/50 border border-border-subtle rounded-xl p-5 hover:border-red-500/20 transition-all">
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">Equipos Atrasados</span>
          <div className="text-3xl font-extrabold text-red-500 mt-2 font-mono flex items-center gap-2">
            {stats.total_delayed}
            {stats.total_delayed > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <div className="text-[10px] text-text-muted mt-1 uppercase">Con más de 5 días</div>
        </div>

        {/* Entregas del mes */}
        <div className="bg-bg-surface/50 border border-border-subtle rounded-xl p-5 hover:border-emerald-500/20 transition-all">
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">Entregados del Mes</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
            {stats.delivered_this_month}
          </div>
          <div className="text-[10px] text-text-muted mt-1 uppercase">Servicios culminados</div>
        </div>

        {/* Promedio de días */}
        <div className="bg-bg-surface/50 border border-border-subtle rounded-xl p-5 hover:border-purple-500/20 transition-all">
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">Promedio de Entrega</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-2 font-mono">
            {stats.avg_days_to_delivery} <span className="text-sm font-normal">días</span>
          </div>
          <div className="text-[10px] text-text-muted mt-1 uppercase">Últimos 30 días</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── DISTRIBUCIÓN POR ESTADO ─── */}
        <div className="lg:col-span-7 bg-bg-surface/40 border border-border-subtle rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle/50 pb-2">
            Equipos por Estado Actual
          </h3>
          {stats.by_status.length === 0 ? (
            <p className="text-[11px] text-text-muted italic uppercase text-center py-10">Sin equipos activos</p>
          ) : (
            <div className="space-y-3.5">
              {stats.by_status.map((item) => {
                const percentage = stats.total_active > 0 ? (item.count / stats.total_active) * 100 : 0
                return (
                  <div key={item.status_name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="uppercase text-text-secondary flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.status_name}
                      </span>
                      <span className="font-bold text-text-primary">{item.count}</span>
                    </div>
                    {/* Barra de progreso visual */}
                    <div className="w-full h-1.5 bg-bg-base border border-border-subtle/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── DISTRIBUCIÓN POR TIPO DE SERVICIO ─── */}
        <div className="lg:col-span-5 bg-bg-surface/40 border border-border-subtle rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle/50 pb-2">
            Tipo de Servicio
          </h3>
          {stats.by_service_type.length === 0 ? (
            <p className="text-[11px] text-text-muted italic uppercase text-center py-10">Sin registros</p>
          ) : (
            <div className="space-y-4">
              {stats.by_service_type.map((item) => {
                const percentage = stats.total_active > 0 ? (item.count / stats.total_active) * 100 : 0
                return (
                  <div key={item.service_type} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="uppercase text-text-secondary">
                        {serviceTypeLabels[item.service_type] || item.service_type}
                      </span>
                      <span className="font-bold text-text-primary">
                        {item.count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full h-1.5 bg-bg-base border border-border-subtle/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-blue rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── LISTA DE EQUIPOS ATRASADOS ─── */}
      <section className="bg-bg-surface/50 border border-border-subtle rounded-xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-red-500 border-b border-border-subtle pb-3 mb-4 flex items-center gap-2">
          🚨 Alerta de Equipos Críticos Atrasados (+5 días)
        </h2>
        {stats.delayed_equipment.length === 0 ? (
          <p className="text-[11px] text-text-muted uppercase italic">
            Excelente. No hay equipos retrasados en taller en este momento.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-widest text-text-muted">
                  <th className="py-2.5">Ficha de Recepción (FR)</th>
                  <th className="py-2.5">Cliente</th>
                  <th className="py-2.5">Estado Actual</th>
                  <th className="py-2.5 text-right">Días Transcurridos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30 text-xs">
                {stats.delayed_equipment.map((eq) => (
                  <tr key={eq.fr_number} className="hover:bg-bg-base/40 text-red-300 font-mono">
                    <td className="py-3 font-semibold tracking-wider">{eq.fr_number}</td>
                    <td className="py-3 uppercase">{eq.client_name}</td>
                    <td className="py-3 uppercase text-[10px]">{eq.status_name}</td>
                    <td className="py-3 text-right text-red-500 font-extrabold">{eq.days_elapsed} días</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
