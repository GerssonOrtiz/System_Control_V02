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
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-neon-blue/40 space-y-3 font-sans shadow-sm"
    >
      {/* FR */}
      <div className="flex justify-between items-center">
        <span className="font-mono text-base font-bold text-neon-blue uppercase tracking-wider">
          {equipment.fr_number}
        </span>
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

        <div className="pt-1">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Técnico</span>
          <span className="font-medium text-text-primary truncate block">
            {equipment.maintenance_tech_username || equipment.diagnosis_tech_username || 'SIN ASIGNAR'}
          </span>
        </div>
      </div>
    </div>
  )
}
