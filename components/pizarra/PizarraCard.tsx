// components/pizarra/PizarraCard.tsx
'use client'

import React, { useState } from 'react'
import EquipmentDetail from '@/components/equipment/EquipmentDetail'

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
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setIsDetailOpen(true)}
        className="bg-bg-surface/60 border border-border-subtle rounded-lg px-3 py-2 flex items-center gap-3 transition-all duration-150 hover:bg-bg-surface hover:border-neon-blue/40 group cursor-pointer shadow-sm mb-1.5"
      >
        {/* Identificador FR - Color en base a estado para referencia rápida */}
        <div 
          className="w-1.5 h-6 rounded-full shrink-0" 
          style={{ backgroundColor: equipment.status_color || '#00E5FF', boxShadow: `0 0 8px ${equipment.status_color}40` }}
        />
        
        {/* FR y Cliente - Información Primaria */}
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-neon-blue uppercase tracking-wider shrink-0 w-16">
            {equipment.fr_number.replace('FR-', '')}
          </span>
          
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-text-primary truncate block uppercase leading-none mb-0.5">
              {equipment.client_name}
            </span>
            <span className="text-[9px] text-text-muted truncate block uppercase tracking-tight">
              {equipment.brand} {equipment.model}
            </span>
          </div>
        </div>

        {/* Botón de información discreto */}
        <button 
          className="text-text-muted group-hover:text-neon-blue transition-colors p-1"
          onClick={(e) => {
            e.stopPropagation()
            setIsDetailOpen(true)
          }}
        >
          <span className="text-xs">ℹ️</span>
        </button>
      </div>

      {/* Modal de Detalle que se abre al hacer click */}
      {isDetailOpen && (
        <EquipmentDetail
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          equipmentId={equipment.id}
          // En la pizarra no solemos mutar directamente desde aquí, 
          // pero dejamos el soporte por si acaso
        />
      )}
    </>
  )
}
