// app/(dashboard)/historial/page.tsx
'use client'

import React, { useState } from 'react'
import { useEquipmentList } from '@/hooks/useEquipmentList'
import EquipmentTable from '@/components/equipment/EquipmentTable'

export default function HistorialPage() {
  const [currentPage, setCurrentPage] = useState(0)
  // Request including delivered equipment
  const { equipments, total, totalPages, isLoading, mutate } = useEquipmentList(currentPage, true)

  // Filter only delivered (terminal) equipment for history view
  const deliveredEquipments = equipments.filter((eq: any) => eq.is_terminal === true)

  return (
    <div className="space-y-6 font-sans text-text-primary p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neon-blue tracking-wider uppercase">📜 Historial de Equipos Entregados</h1>
        <p className="text-text-secondary text-xs mt-1">
          Registro histórico de todos los equipos entregados al cliente tras completar el servicio técnico.
        </p>
      </div>

      {/* Main Table Container */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-neon-blue animate-pulse font-mono text-xs uppercase tracking-widest">
              Cargando historial de entregados...
            </span>
          </div>
        ) : (
          <EquipmentTable
            equipments={deliveredEquipments}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onUpdateSuccess={mutate}
          />
        )}
      </div>
    </div>
  )
}
