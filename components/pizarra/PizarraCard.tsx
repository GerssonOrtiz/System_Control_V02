// components/pizarra/PizarraCard.tsx
'use client'

import React from 'react'

interface PizarraCardProps {
  equipment: {
    id: string
    fr_number: string
    client_name: string
    brand: string
    model: string
    days_elapsed: number
    diagnosis_tech_username?: string | null
    maintenance_tech_username?: string | null
    status_color?: string
  }
}

export default function PizarraCard({ equipment }: PizarraCardProps) {
  const isDelayed = equipment.days_elapsed > 5

  return (
    <div
      className={`bg-bg-surface border rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 space-y-3 font-sans ${
        isDelayed
          ? 'border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-[glowPulse_2s_ease-in-out_infinite]'
          : 'border-border-subtle hover:border-neon-blue/40'
      }`}
    >
      {/* FR & Delay Badge */}
      <div className="flex justify-between items-center">
        <span className="font-mono text-base font-bold text-neon-blue uppercase tracking-wider">
          {equipment.fr_number}
        </span>
        {isDelayed && (
          <span className="text-[9px] font-extrabold bg-red-500/10 border border-red-500/50 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
            ⚠️ ATRASADO
          </span>
        )}
      </div>

      {/* Main Stats */}
      <div className="space-y-1.5 text-xs text-text-secondary">
        <div>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Cliente</span>
          <span className="font-semibold text-text-primary text-[13px] truncate block">
            {equipment.client_name}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Modelo</span>
          <span className="font-medium text-text-primary truncate block">
            {equipment.brand} - {equipment.model}
          </span>
        </div>

        <div className="flex justify-between items-center pt-1">
          <div>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Técnico</span>
            <span className="font-medium text-text-primary truncate max-w-[120px] block">
              {equipment.maintenance_tech_username || equipment.diagnosis_tech_username || 'SIN ASIGNAR'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">T. Transcurrido</span>
            <span className={`font-mono font-bold ${isDelayed ? 'text-red-400' : 'text-text-primary'}`}>
              {equipment.days_elapsed} {equipment.days_elapsed === 1 ? 'día' : 'días'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
