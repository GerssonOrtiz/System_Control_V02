// app/(dashboard)/taller/page.tsx
'use client'

import React, { useState } from 'react'
import { useEquipmentList } from '@/hooks/useEquipmentList'
import { useRealtimePizarra } from '@/hooks/useRealtimePizarra'
import StatusBadge from '@/components/equipment/StatusBadge'
import EquipmentDetail from '@/components/equipment/EquipmentDetail'
import StatusChangeModal from '@/components/equipment/StatusChangeModal'

export default function TallerPage() {
  const { equipments, isLoading, mutate } = useEquipmentList(0, false)
  const [selectedEq, setSelectedEq] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false)

  // Enable Realtime refreshes
  useRealtimePizarra(mutate)

  // Filter columns
  // Columna 1: En diagnóstico (estados: En espera de diagnóstico, En diagnóstico)
  const col1States = ['En espera de diagnóstico', 'En diagnóstico']
  const column1Equipments = equipments.filter((eq: any) => col1States.includes(eq.status_name))

  // Columna 2: Aprobados / Mantenimiento
  const col2States = [
    'Repuesto entregado',
    'Aprobado',
    'Inicio de mantenimiento',
    'En mantenimiento',
    'En espera de repuesto adicional',
  ]
  const column2Equipments = equipments.filter((eq: any) => col2States.includes(eq.status_name))

  const handleOpenDetail = (eq: any) => {
    setSelectedEq(eq)
    setIsDetailOpen(true)
  }

  const handleOpenStatusChange = (eq: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEq(eq)
    setIsChangeStatusOpen(true)
  }

  const renderCard = (eq: any) => {
    const isDelayed = eq.days_elapsed > 5
    return (
      <div
        key={eq.id}
        onClick={() => handleOpenDetail(eq)}
        className={`bg-bg-surface border rounded-xl p-4 cursor-pointer hover:-translate-y-0.5 transition-all space-y-3 relative group ${
          isDelayed
            ? 'border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.1)] hover:border-red-500/80'
            : 'border-border-subtle hover:border-neon-blue/40'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <span className="font-mono text-sm font-bold text-neon-blue uppercase tracking-wider">
            {eq.fr_number}
          </span>
          <StatusBadge status={eq.status_name} color={eq.status_color} />
        </div>

        {/* Content */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-text-secondary uppercase">Cliente:</span>
            <span className="font-medium text-text-primary max-w-[150px] truncate">{eq.client_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary uppercase">Equipo:</span>
            <span className="text-text-secondary font-medium truncate">{eq.brand} - {eq.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary uppercase">Técnico:</span>
            <span className="text-text-primary truncate">
              {eq.maintenance_tech_username || eq.diagnosis_tech_username || 'SIN ASIGNAR'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-border-subtle/50 text-[10px]">
          <div>
            {isDelayed ? (
              <span className="text-red-500 font-bold flex items-center gap-1 animate-pulse">
                ⚠️ ATRASADO ({eq.days_elapsed} días)
              </span>
            ) : (
              <span className="text-text-secondary">{eq.days_elapsed} días transcurridos</span>
            )}
          </div>

          <button
            onClick={(e) => handleOpenStatusChange(eq, e)}
            className="px-2.5 py-1 rounded bg-electric/90 text-white font-bold uppercase hover:bg-electric transition-colors"
          >
            Cambiar →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans text-text-primary p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neon-blue tracking-wider uppercase">🔧 Vista de Taller (Operaciones)</h1>
        <p className="text-text-secondary text-xs mt-1">
          Seguimiento de diagnósticos y mantenimientos de motosoldadoras asignadas al taller.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <span className="text-neon-blue animate-pulse font-mono tracking-widest uppercase">
            Cargando tablero del taller...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[60vh]">
          {/* Columna 1: En diagnóstico */}
          <div className="bg-bg-surface/30 border border-border-subtle rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neon-blue">
                🔬 En Diagnóstico ({column1Equipments.length})
              </h2>
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {column1Equipments.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-8">No hay equipos en diagnóstico.</p>
              ) : (
                column1Equipments.map(renderCard)
              )}
            </div>
          </div>

          {/* Columna 2: Aprobados / Mantenimiento */}
          <div className="bg-bg-surface/30 border border-border-subtle rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                🛠️ Aprobados / En Mantenimiento ({column2Equipments.length})
              </h2>
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {column2Equipments.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-8">
                  No hay equipos en mantenimiento o aprobados.
                </p>
              ) : (
                column2Equipments.map(renderCard)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {selectedEq && (
        <EquipmentDetail
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedEq(null)
          }}
          equipmentId={selectedEq.id}
          onStatusUpdated={mutate}
        />
      )}

      {/* Modal Cambio de Estado Autónomo */}
      {selectedEq && (
        <EquipmentDetail
          isOpen={isChangeStatusOpen}
          onClose={() => {
            setIsChangeStatusOpen(false)
            setSelectedEq(null)
          }}
          equipmentId={selectedEq.id}
          onStatusUpdated={mutate}
        />
      )}
    </div>
  )
}
