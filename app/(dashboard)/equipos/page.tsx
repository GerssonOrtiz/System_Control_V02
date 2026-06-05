'use client'

import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { useEquipmentList } from '@/hooks/useEquipmentList'
import { useUser } from '@/hooks/useUser'
import { useRealtimePizarra } from '@/hooks/useRealtimePizarra'
import EquipmentTable from '@/components/equipment/EquipmentTable'
import EquipmentForm from '@/components/equipment/EquipmentForm'

export default function EquiposPage() {
  const { role } = useUser()
  const [currentPage, setCurrentPage] = useState(0)
  const { equipments, total, totalPages, isLoading, mutate } = useEquipmentList(currentPage, false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  // Realtime subscription
  useRealtimePizarra(mutate)

  const canRegister = ['superadmin', 'admin', 'recepcion'].includes(role || '')

  const handleDeleteAll = async () => {
    const confirmText = window.prompt(
      '¿Está seguro de que desea eliminar permanentemente TODOS los equipos de la base de datos?\nEsta acción es irreversible y borrará el historial de estados de todos los equipos.\n\nPara confirmar, escriba "ELIMINAR" en la casilla de abajo:'
    )

    if (confirmText !== 'ELIMINAR') {
      if (confirmText !== null) {
        toast.error('Confirmación incorrecta. No se eliminaron los equipos.')
      }
      return
    }

    setIsDeletingAll(true)
    try {
      const res = await fetch('/api/equipment', {
        method: 'DELETE',
      })
      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Ocurrió un error al eliminar los equipos')
      }
      toast.success('Se han eliminado todos los equipos con éxito')
      mutate()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al eliminar todos los equipos')
    } finally {
      setIsDeletingAll(false)
    }
  }

  const getPageTitle = () => {
    if (role === 'recepcion') return '📥 Módulo de Recepción — Equipos Relevantes'
    if (role === 'almacen') return '📦 Módulo de Almacén — Equipos en Espera de Repuestos'
    return '📋 Lista de Equipos Activos'
  }

  const getPageDescription = () => {
    if (role === 'recepcion') {
      return 'Registro de nuevos ingresos y entrega de motosoldadoras culminadas.'
    }
    if (role === 'almacen') {
      return 'Bandeja de equipos pendientes de entrega de repuestos técnicos.'
    }
    return 'Seguimiento completo de todos los equipos en proceso activo.'
  }

  return (
    <div className="space-y-6 font-sans text-text-primary p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neon-blue tracking-wider uppercase">{getPageTitle()}</h1>
          <p className="text-text-secondary text-xs mt-1">{getPageDescription()}</p>
        </div>

        <div className="flex items-center gap-3">
          {role === 'superadmin' && (
            <button
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all disabled:opacity-40 select-none shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              {isDeletingAll ? '🔴 Eliminando...' : '🔴 Eliminar Todo'}
            </button>
          )}
          {['superadmin', 'admin', 'visualizador'].includes(role || '') && (
            <div className="flex gap-2">
              <a
                href="/api/equipment/export?format=xlsx"
                download
                className="bg-bg-surface hover:bg-bg-surface/85 border border-border-subtle hover:border-neon-blue text-text-primary text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-2.5 rounded-lg transition-all inline-block select-none"
              >
                📤 Exportar Excel
              </a>
              <a
                href="/api/equipment/export?format=csv"
                download
                className="bg-bg-surface hover:bg-bg-surface/85 border border-border-subtle hover:border-neon-blue text-text-primary text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-2.5 rounded-lg transition-all inline-block select-none"
              >
                📄 CSV
              </a>
            </div>
          )}

          {canRegister && (
            <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
              <Dialog.Trigger asChild>
                <button className="px-5 py-2.5 rounded-lg bg-electric text-white text-xs font-bold uppercase hover:shadow-neon-blue hover:brightness-110 transition-all select-none">
                  ➕ Registrar nuevo equipo
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-bg-base/85 backdrop-blur-sm z-50 transition-opacity" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[750px] max-h-[90vh] overflow-y-auto bg-bg-surface border border-neon-blue/30 rounded-xl shadow-neon-blue p-6 md:p-8 z-50 text-text-primary animate-in fade-in zoom-in-95 duration-150 scrollbar-thin">
                  <Dialog.Title className="text-lg font-bold text-neon-blue mb-6 border-b border-border-subtle pb-2 uppercase tracking-wider">
                    📥 Registrar Nuevo Ingreso de Equipo
                  </Dialog.Title>
                  <EquipmentForm
                    onSuccess={() => {
                      setIsFormOpen(false)
                      mutate()
                    }}
                    onCancel={() => setIsFormOpen(false)}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-neon-blue animate-pulse font-mono text-xs uppercase tracking-widest">
              Cargando lista de equipos...
            </span>
          </div>
        ) : (
          <EquipmentTable
            equipments={equipments}
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
