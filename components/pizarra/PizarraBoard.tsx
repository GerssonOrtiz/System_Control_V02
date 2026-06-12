// components/pizarra/PizarraBoard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRealtimePizarra } from '@/hooks/useRealtimePizarra'
import PizarraCard from './PizarraCard'

export default function PizarraBoard({ searchQuery = '' }: { searchQuery?: string }) {
  const { groupedByStatus, isLoading } = useRealtimePizarra()
  const [columns, setColumns] = useState<any[]>([])

  // Helper to filter equipment based on searchQuery
  const filterEquipments = (equipments: any[]) => {
    if (!searchQuery) return equipments
    const q = searchQuery.toLowerCase().trim()
    return equipments.filter((eq: any) => 
      eq.fr_number?.toLowerCase().includes(q) ||
      eq.client_name?.toLowerCase().includes(q) ||
      eq.brand?.toLowerCase().includes(q) ||
      eq.model?.toLowerCase().includes(q)
    )
  }

  // Load workflow states for the columns
  useEffect(() => {
    fetch('/api/workflow/states')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Exclude terminal states (like "Entregado") from the kiosk board
          const activeStates = data.data.filter((s: any) => !s.is_terminal)
          setColumns(activeStates)
        }
      })
      .catch((err) => console.error('Error fetching states for columns:', err))
  }, [])

  if (isLoading || columns.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <span className="text-neon-blue animate-pulse font-mono tracking-widest text-sm uppercase">
          Inicializando Conexión Satelital de Pizarra...
        </span>
      </div>
    )
  }

  const orderedDiagNames = ['En espera de diagnóstico', 'En diagnóstico', 'En espera de repuesto']
  const orderedServNames = ['Aprobado', 'En mantenimiento', 'En espera de repuesto adicional']

  const diagCols = orderedDiagNames
    .map(name => columns.find(c => c.name.trim().toUpperCase() === name.toUpperCase()))
    .filter(Boolean)
    .filter(col => {
      if (col.name === 'En espera de repuesto') {
        return (groupedByStatus[col.name]?.length || 0) > 0
      }
      return true
    }) as any[]

  const servCols = orderedServNames
    .map(name => columns.find(c => c.name.trim().toUpperCase() === name.toUpperCase()))
    .filter(Boolean)
    .filter(col => {
      if (col.name === 'En espera de repuesto adicional') {
        return (groupedByStatus[col.name]?.length || 0) > 0
      }
      return true
    }) as any[]

  return (
    <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col min-w-full">
      {/* Sección Diagnósticos */}
      <div className="flex-1 flex flex-col min-h-0 bg-bg-surface/10 border border-border-subtle/40 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3 select-none">
          <div className="w-1.5 h-5 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-neon-blue">
            🔎 Módulo de Diagnósticos
          </h2>
        </div>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-2 scrollbar-thin items-start">
          {diagCols.map((col: any) => {
            const equipmentsInCol = filterEquipments(groupedByStatus[col.name] || [])
            return (
              <div
                key={col.id}
                className="flex-1 min-w-0 bg-bg-surface/30 border border-border-subtle/80 rounded-xl p-4 flex flex-col max-h-full"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center pb-2 border-b border-border-subtle/60 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: col.color, boxShadow: `0 0 8px ${col.color}` }}
                    />
                    {col.name}
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-bg-base border border-border-subtle text-text-secondary px-2 py-0.5 rounded-full">
                    {equipmentsInCol.length}
                  </span>
                </div>

                {/* Cards Area */}
                <div className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-thin min-h-[80px]">
                  {equipmentsInCol.length === 0 ? (
                    <div className="text-center py-6 text-[10px] text-text-muted italic">
                      Sin equipos
                    </div>
                  ) : (
                    equipmentsInCol.map((eq: any) => (
                      <PizarraCard key={eq.id} equipment={eq} />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sección Servicio */}
      <div className="flex-1 flex flex-col min-h-0 bg-bg-surface/10 border border-border-subtle/40 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3 select-none">
          <div className="w-1.5 h-5 rounded-full bg-neon-purple shadow-[0_0_10px_rgba(157,78,221,0.5)]" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-neon-purple">
            ⚙️ Servicio de Taller (Mantenimiento)
          </h2>
        </div>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-2 scrollbar-thin items-start">
          {servCols.map((col: any) => {
            const equipmentsInCol = filterEquipments(groupedByStatus[col.name] || [])
            return (
              <div
                key={col.id}
                className="flex-1 min-w-0 bg-bg-surface/30 border border-border-subtle/80 rounded-xl p-4 flex flex-col max-h-full"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center pb-2 border-b border-border-subtle/60 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: col.color, boxShadow: `0 0 8px ${col.color}` }}
                    />
                    {col.name}
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-bg-base border border-border-subtle text-text-secondary px-2 py-0.5 rounded-full">
                    {equipmentsInCol.length}
                  </span>
                </div>

                {/* Cards Area */}
                <div className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-thin min-h-[80px]">
                  {equipmentsInCol.length === 0 ? (
                    <div className="text-center py-6 text-[10px] text-text-muted italic">
                      Sin equipos
                    </div>
                  ) : (
                    equipmentsInCol.map((eq: any) => (
                      <PizarraCard key={eq.id} equipment={eq} />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
