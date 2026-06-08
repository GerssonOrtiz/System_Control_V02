// app/(dashboard)/dashboard/page.tsx
'use client'

import React, { useState } from 'react'
import { useDashboardStats, useEquipmentList } from '@/hooks/useEquipmentList'
import EquipmentTable from '@/components/equipment/EquipmentTable'
import StatusBadge from '@/components/equipment/StatusBadge'

export default function DashboardPage() {
  const [activePage, setActivePage] = useState(0)
  const { stats, isLoading: loadingStats, mutate: mutateStats } = useDashboardStats()
  const { equipments, total, totalPages, isLoading: loadingEquips, mutate: mutateEquips } = useEquipmentList(activePage, true)

  const handleUpdateSuccess = () => {
    mutateStats()
    mutateEquips()
  }

  // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')

  // Apply filters locally on the fetched page of equipments
  const filteredEquipments = equipments.filter((eq: any) => {
    const matchStatus = statusFilter ? eq.status_name === statusFilter : true
    const matchService = serviceFilter ? eq.service_type === serviceFilter : true
    return matchStatus && matchService
  })

  // Get unique statuses and service types from current page for filtering options
  const statusOptions = Array.from(new Set(equipments.map((eq: any) => eq.status_name)))
  const serviceOptions = Array.from(new Set(equipments.map((eq: any) => eq.service_type)))

  return (
    <div className="space-y-6 font-sans text-text-primary p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neon-blue tracking-wider uppercase">📊 Dashboard Administrativo</h1>
        <p className="text-text-secondary text-xs mt-1">Monitoreo global de equipos, métricas de rendimiento y registro histórico.</p>
      </div>

      {/* Main Global Equipment Section - NOW AT TOP */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neon-blue">📋 Registro General de Equipos ({total})</h2>
            <p className="text-[10px] text-text-muted">Incluye equipos activos, entregados y en revisión.</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg-base/60 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-neon-blue focus:outline-none transition-all"
            >
              <option value="">Todos los Estados</option>
              {statusOptions.map((opt: any) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-bg-base/60 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-neon-blue focus:outline-none transition-all"
            >
              <option value="">Todos los Servicios</option>
              {serviceOptions.map((opt: any) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Equipment Table */}
        {loadingEquips ? (
          <div className="flex justify-center items-center py-12">
            <span className="text-neon-blue animate-pulse font-mono text-xs uppercase tracking-widest">Cargando base de datos completa...</span>
          </div>
        ) : (
          <EquipmentTable
            equipments={filteredEquipments}
            currentPage={activePage}
            totalPages={totalPages}
            onPageChange={setActivePage}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}
      </div>

      {/* Stats Grid */}
      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-bg-surface border border-border-subtle rounded-xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {/* Activos */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-[0_0_12px_rgba(0,229,255,0.03)] hover:border-neon-blue/20 transition-all">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Equipos Activos</span>
            <div className="text-2xl font-bold text-neon-blue mt-1 font-mono">{stats.total_active}</div>
          </div>
          {/* Atrasados */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-[0_0_12px_rgba(239,68,68,0.03)] hover:border-red-500/20 transition-all">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Atrasados (+5 Días)</span>
            <div className="text-2xl font-bold text-red-500 mt-1 font-mono">{stats.total_delayed}</div>
          </div>
          {/* Entregados este mes */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-[0_0_12px_rgba(16,185,129,0.03)] hover:border-emerald-500/20 transition-all">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Entregados este Mes</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{stats.delivered_this_month}</div>
          </div>
          {/* Tiempo promedio */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-[0_0_12px_rgba(157,78,221,0.03)] hover:border-neon-purple/20 transition-all">
            <span className="text-[10px] font-bold text-neon-purple uppercase tracking-wider">Promedio Días de Entrega</span>
            <div className="text-2xl font-bold text-neon-purple mt-1 font-mono">{stats.avg_days_to_delivery}d</div>
          </div>
        </div>
      ) : null}

      {/* Alerta Equipos Atrasados */}
      {stats && stats.delayed_equipment && stats.delayed_equipment.length > 0 && (
        <div className="bg-bg-surface border border-red-500/30 shadow-neon-red rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <span className="text-lg">⚠️</span>
            <h2 className="text-sm font-bold uppercase tracking-wider">Alertas críticas de retraso</h2>
          </div>
          <div className="overflow-x-auto border border-red-500/20 rounded-lg bg-bg-base/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-red-500/20 bg-red-950/10 text-red-400 font-bold uppercase tracking-wider">
                  <th className="px-4 py-2.5">Ficha</th>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5 text-right">Tiempo Retraso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-500/10">
                {stats.delayed_equipment.map((eq: any, idx: number) => (
                  <tr key={eq.fr_number || idx} className="hover:bg-red-500/5 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-red-400">{eq.fr_number}</td>
                    <td className="px-4 py-3 text-text-primary">{eq.client_name}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-red-500/10 border border-red-500/40 text-red-400 px-2 py-0.5 rounded font-bold uppercase">
                        {eq.status_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-500 font-mono">{eq.days_elapsed} días</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
