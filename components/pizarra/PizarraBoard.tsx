// components/pizarra/PizarraBoard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRealtimePizarra } from '@/hooks/useRealtimePizarra'
import PizarraCard from './PizarraCard'

export default function PizarraBoard() {
  const { groupedByStatus, isLoading } = useRealtimePizarra()
  const [columns, setColumns] = useState<any[]>([])

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

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin h-[calc(100vh-140px)] min-w-full items-start px-2">
      {columns.map((col) => {
        const equipmentsInCol = groupedByStatus[col.name] || []
        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-80 bg-bg-surface/40 border border-border-subtle rounded-xl p-4 flex flex-col max-h-full"
          >
            {/* Column Header */}
            <div className="flex justify-between items-center pb-3 border-b border-border-subtle mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: col.color }}
                />
                {col.name}
              </h3>
              <span className="text-[10px] font-mono font-bold bg-bg-base border border-border-subtle text-text-secondary px-2 py-0.5 rounded-full">
                {equipmentsInCol.length}
              </span>
            </div>

            {/* Cards Area */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 scrollbar-thin min-h-[100px]">
              {equipmentsInCol.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-text-muted italic">
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
  )
}
