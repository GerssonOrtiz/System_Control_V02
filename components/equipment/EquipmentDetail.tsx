// components/equipment/EquipmentDetail.tsx
'use client'

import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { useEquipmentDetail } from '@/hooks/useEquipmentList'
import { useUser } from '@/hooks/useUser'
import StatusBadge from './StatusBadge'
import StatusChangeModal from './StatusChangeModal'

interface EquipmentDetailProps {
  isOpen: boolean
  onClose: () => void
  equipmentId: string | null
  onStatusUpdated?: () => void
}

export default function EquipmentDetail({
  isOpen,
  onClose,
  equipmentId,
  onStatusUpdated,
}: EquipmentDetailProps) {
  const { user, profile, role } = useUser()
  const { equipment, history, nextStates, canAdvance, isLoading, mutate } = useEquipmentDetail(equipmentId)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit fields state
  const [editFr, setEditFr] = useState('')
  const [editClientName, setEditClientName] = useState('')
  const [editBrand, setEditBrand] = useState('')
  const [editModel, setEditModel] = useState('')
  const [editSerial, setEditSerial] = useState('')
  const [editReportNumber, setEditReportNumber] = useState('')
  const [editServiceType, setEditServiceType] = useState('')
  const [editDateIn, setEditDateIn] = useState('')
  const [editClientReport, setEditClientReport] = useState('')
  const [editAccessories, setEditAccessories] = useState('')
  const [editConditionIn, setEditConditionIn] = useState('')
  const [editObservations, setEditObservations] = useState('')

  if (!equipmentId) return null

  const handleStatusChangeSuccess = () => {
    mutate()
    if (onStatusUpdated) onStatusUpdated()
  }

  // Format date to local Lima format
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const isSuperadmin = role === 'superadmin'

  const startEditMode = () => {
    if (!equipment) return
    setEditFr(equipment.fr_number || '')
    setEditClientName(equipment.client_name || '')
    setEditBrand(equipment.brand || '')
    setEditModel(equipment.model || '')
    setEditSerial(equipment.serial_number || '')
    setEditReportNumber(equipment.report_number || '')
    setEditServiceType(equipment.service_type || 'REVISION_GENERAL')
    if (equipment.date_in) {
      try {
        const d = new Date(equipment.date_in)
        const offset = d.getTimezoneOffset()
        const localDate = new Date(d.getTime() - (offset * 60 * 1000))
        setEditDateIn(localDate.toISOString().slice(0, 16))
      } catch {
        setEditDateIn('')
      }
    } else {
      setEditDateIn('')
    }
    setEditClientReport(equipment.client_report || '')
    setEditAccessories(equipment.accessories || '')
    setEditConditionIn(equipment.condition_in || '')
    setEditObservations(equipment.additional_observations || '')
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/equipment/${equipmentId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fr_number: editFr,
          client_name: editClientName,
          brand: editBrand,
          model: editModel,
          serial_number: editSerial,
          report_number: editReportNumber,
          service_type: editServiceType,
          date_in: editDateIn ? new Date(editDateIn).toISOString() : undefined,
          client_report: editClientReport,
          accessories: editAccessories,
          condition_in: editConditionIn,
          additional_observations: editObservations,
        })
      })

      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'No se pudo actualizar el equipo')
      }

      toast.success('Información del equipo actualizada con éxito')
      setIsEditing(false)
      mutate()
      if (onStatusUpdated) onStatusUpdated()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al guardar cambios')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-bg-base/85 backdrop-blur-sm z-40 transition-opacity" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] max-h-[90vh] overflow-y-auto bg-bg-surface border border-neon-blue/20 rounded-xl shadow-neon-blue p-6 md:p-8 z-40 font-sans text-text-primary animate-in fade-in zoom-in-95 duration-150 scrollbar-thin">
            <Dialog.Title className="text-xl font-bold text-neon-blue mb-6 flex justify-between items-center border-b border-border-subtle pb-3">
              <span>📋 Ficha Detallada: {equipment?.fr_number || 'Cargando...'}</span>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-neon-blue transition-colors text-sm font-semibold uppercase"
              >
                Cerrar
              </button>
            </Dialog.Title>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="text-neon-blue animate-pulse font-mono tracking-widest uppercase">Cargando detalles del equipo...</span>
              </div>
            ) : !equipment ? (
              <div className="text-center py-12">
                <p className="text-red-400 font-semibold">No se pudo cargar la información del equipo.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Encabezado rápido con estado y acciones */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-base/40 p-4 rounded-lg border border-border-subtle">
                  <div className="space-y-1">
                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Estado Actual</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={equipment.status_name} color={equipment.status_color} />
                      {equipment.days_elapsed > 5 && !equipment.is_terminal && (
                        <span className="text-red-400 text-xs font-bold animate-pulse">⚠️ ATRASADO ({equipment.days_elapsed} días)</span>
                      )}
                    </div>
                  </div>

                  {/* Acciones de cambio de estado / edición */}
                  <div className="flex gap-2">
                    {isSuperadmin && (
                      <button
                        onClick={isEditing ? handleSaveEdit : startEditMode}
                        disabled={isSaving}
                        className={`px-5 py-2.5 rounded-lg text-white text-xs font-bold uppercase hover:brightness-110 transition-all select-none ${
                          isEditing
                            ? 'bg-emerald-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'bg-neon-purple/70 border border-neon-purple hover:bg-neon-purple/90'
                        }`}
                      >
                        {isSaving ? 'Guardando...' : isEditing ? '💾 Guardar Cambios' : '✏️ Editar Ficha'}
                      </button>
                    )}
                    {isEditing && (
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-5 py-2.5 rounded-lg bg-bg-surface hover:bg-bg-surface/85 border border-border-subtle text-text-primary text-xs font-bold uppercase transition-all select-none"
                      >
                        Cancelar
                      </button>
                    )}
                    {(canAdvance || isSuperadmin) && !isEditing && (
                      <button
                        onClick={() => setIsStatusModalOpen(true)}
                        className="px-5 py-2.5 rounded-lg bg-electric text-white text-xs font-bold uppercase hover:shadow-neon-blue hover:brightness-110 transition-all select-none"
                      >
                        {isSuperadmin ? '⚡ Cambiar/Forzar Estado' : '🔄 Avanzar Estado'}
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Información General */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-base/20 p-5 rounded-lg border border-border-subtle">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider border-b border-border-subtle/50 pb-1">Datos Generales</h3>
                    <div className="grid grid-cols-3 gap-3 text-xs items-center">
                      <span className="text-text-secondary font-semibold uppercase">Ficha (FR):</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFr}
                          onChange={(e) => setEditFr(e.target.value)}
                          className="col-span-2 bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs focus:border-neon-blue focus:outline-none font-mono text-text-primary"
                        />
                      ) : (
                        <span className="col-span-2 font-mono font-bold text-neon-blue uppercase">{equipment.fr_number}</span>
                      )}

                      <span className="text-text-secondary font-semibold uppercase">Cliente:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editClientName}
                          onChange={(e) => setEditClientName(e.target.value)}
                          className="col-span-2 bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs focus:border-neon-blue focus:outline-none text-text-primary"
                        />
                      ) : (
                        <span className="col-span-2 font-medium">{equipment.client_name}</span>
                      )}

                      <span className="text-text-secondary font-semibold uppercase">Servicio:</span>
                      {isEditing ? (
                        <select
                          value={editServiceType}
                          onChange={(e) => setEditServiceType(e.target.value)}
                          className="col-span-2 bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs focus:border-neon-blue focus:outline-none text-text-primary"
                        >
                          <option value="GARANTIA_CABELAB">GARANTÍA CABELAB</option>
                          <option value="GARANTIA_ESAB">GARANTÍA ESAB</option>
                          <option value="REVISION_GENERAL">REVISIÓN GENERAL</option>
                        </select>
                      ) : (
                        <span className="col-span-2 font-mono text-[11px] text-neon-purple font-semibold">{equipment.service_type}</span>
                      )}

                      <span className="text-text-secondary font-semibold uppercase">Marca:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editBrand}
                          onChange={(e) => setEditBrand(e.target.value)}
                          className="col-span-2 bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs focus:border-neon-blue focus:outline-none text-text-primary"
                        />
                      ) : (
                        <span className="col-span-2 font-medium">{equipment.brand}</span>
                      )}

                      <span className="text-text-secondary font-semibold uppercase">Modelo:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editModel}
                          onChange={(e) => setEditModel(e.target.value)}
                          className="col-span-2 bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs focus:border-neon-blue focus:outline-none text-text-primary"
                        />
                      ) : (
                        <span className="col-span-2 font-medium">{equipment.model}</span>
                      )}

                      <span className="text-text-secondary font-semibold uppercase">N° Serie:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editSerial}
                          onChange={(e) => setEditSerial(e.target.value)}
                          className="col-span-2 bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs focus:border-neon-blue focus:outline-none font-mono text-text-primary"
                        />
                      ) : (
                        <span className="col-span-2 font-mono">{equipment.serial_number}</span>
                      )}

                      <span className="text-text-secondary font-semibold uppercase">N° Informe:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editReportNumber}
                          onChange={(e) => setEditReportNumber(e.target.value)}
                          className="col-span-2 bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs focus:border-neon-blue focus:outline-none font-mono text-text-primary"
                        />
                      ) : (
                        <span className="col-span-2 font-mono text-neon-blue font-semibold">{equipment.report_number || 'PENDIENTE'}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider border-b border-border-subtle/50 pb-1">Personal Asignado</h3>
                    <div className="flex flex-wrap gap-2 py-1">
                      {equipment.assigned_technicians && equipment.assigned_technicians.length > 0 ? (
                        equipment.assigned_technicians.map((tech: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-neon-blue/10 border border-neon-blue/20 text-neon-blue uppercase shadow-[0_0_10px_rgba(0,229,255,0.05)]">
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-muted italic">SIN PERSONAL ASIGNADO</span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider border-b border-border-subtle/50 pb-1 pt-2">Tiempos Operativos</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs items-center">
                      <span className="text-text-secondary font-semibold uppercase">Ingreso:</span>
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          value={editDateIn}
                          onChange={(e) => setEditDateIn(e.target.value)}
                          className="col-span-2 bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs focus:border-neon-blue focus:outline-none text-text-primary"
                        />
                      ) : (
                        <span className="col-span-2">{formatDate(equipment.date_in)}</span>
                      )}

                      <span className="text-text-secondary font-semibold uppercase">Diagnóstico:</span>
                      <span className="col-span-2">{equipment.start_diagnosis_at ? `${formatDate(equipment.start_diagnosis_at)} (Inicio)` : 'PENDIENTE'}</span>

                      <span className="text-text-secondary font-semibold uppercase">Mantenimiento:</span>
                      <span className="col-span-2">{equipment.start_maintenance_at ? `${formatDate(equipment.start_maintenance_at)} (Inicio)` : 'PENDIENTE'}</span>
                    </div>

                    <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider border-b border-border-subtle/50 pb-1 pt-4">Seguimiento por Fases</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2">
                      <div className="bg-bg-base/40 p-2 rounded-lg border border-border-subtle flex flex-col items-center text-center">
                        <span className="text-[9px] text-text-secondary font-bold uppercase mb-1 leading-tight">Fase 1:<br/>Ingreso → Pendiente</span>
                        <span className="text-base font-mono font-bold text-neon-blue">{equipment.phase_1_days} <small className="text-[9px]">DÍAS</small></span>
                      </div>
                      <div className="bg-bg-base/40 p-2 rounded-lg border border-border-subtle flex flex-col items-center text-center">
                        <span className="text-[9px] text-text-secondary font-bold uppercase mb-1 leading-tight">Fase 2:<br/>Evaluación → Aprobación</span>
                        <span className="text-base font-mono font-bold text-neon-purple">{equipment.phase_2_days} <small className="text-[9px]">DÍAS</small></span>
                      </div>
                      <div className="bg-bg-base/40 p-2 rounded-lg border border-border-subtle flex flex-col items-center text-center">
                        <span className="text-[9px] text-text-secondary font-bold uppercase mb-1 leading-tight">Fase 3:<br/>Aprobación → Entrega</span>
                        <span className="text-base font-mono font-bold text-emerald-400">{equipment.phase_3_days} <small className="text-[9px]">DÍAS</small></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Reportes y Observaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Falla Reportada por Cliente</span>
                    {isEditing ? (
                      <textarea
                        value={editClientReport}
                        onChange={(e) => setEditClientReport(e.target.value)}
                        rows={3}
                        className="w-full bg-bg-base border border-border-subtle rounded-lg p-2.5 text-xs focus:border-neon-blue focus:outline-none text-text-primary resize-none"
                      />
                    ) : (
                      <div className="text-xs bg-bg-base/40 p-3 rounded-lg border border-border-subtle min-h-[70px] whitespace-pre-wrap">
                        {equipment.client_report || 'NINGUNO'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Accesorios Incluidos</span>
                    {isEditing ? (
                      <textarea
                        value={editAccessories}
                        onChange={(e) => setEditAccessories(e.target.value)}
                        rows={3}
                        className="w-full bg-bg-base border border-border-subtle rounded-lg p-2.5 text-xs focus:border-neon-blue focus:outline-none text-text-primary resize-none"
                      />
                    ) : (
                      <div className="text-xs bg-bg-base/40 p-3 rounded-lg border border-border-subtle min-h-[70px] whitespace-pre-wrap">
                        {equipment.accessories || 'NINGUNO'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Condición Física de Ingreso</span>
                    {isEditing ? (
                      <textarea
                        value={editConditionIn}
                        onChange={(e) => setEditConditionIn(e.target.value)}
                        rows={3}
                        className="w-full bg-bg-base border border-border-subtle rounded-lg p-2.5 text-xs focus:border-neon-blue focus:outline-none text-text-primary resize-none"
                      />
                    ) : (
                      <div className="text-xs bg-bg-base/40 p-3 rounded-lg border border-border-subtle min-h-[70px] whitespace-pre-wrap">
                        {equipment.condition_in || 'NINGUNO'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Observaciones Técnicas</span>
                    {isEditing ? (
                      <textarea
                        value={editObservations}
                        onChange={(e) => setEditObservations(e.target.value)}
                        rows={3}
                        className="w-full bg-bg-base border border-border-subtle rounded-lg p-2.5 text-xs focus:border-neon-blue focus:outline-none text-text-primary resize-none"
                      />
                    ) : (
                      <div className="text-xs bg-bg-base/40 p-3 rounded-lg border border-border-subtle min-h-[70px] whitespace-pre-wrap text-neon-blue">
                        {equipment.additional_observations || 'NINGUNA'}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Historial de Estados */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider border-b border-border-subtle pb-1">Historial de Estados</h3>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
                    {history.length === 0 ? (
                      <p className="text-xs text-text-secondary">No hay registros de historial de estado.</p>
                    ) : (
                      history.map((h: any, idx: number) => (
                        <div key={h.id || idx} className="flex flex-col gap-1 p-3 text-xs bg-bg-base/30 rounded-lg border border-border-subtle/50">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-text-secondary font-mono">{h.previous_status || 'REGISTRO'}</span>
                              <span className="text-neon-blue font-bold">➔</span>
                              <span className="text-neon-blue font-bold uppercase">{h.new_status}</span>
                            </div>
                            <span className="text-[10px] text-text-muted">{formatDate(h.timestamp)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1">
                            <span>Modificado por: <strong className="text-text-primary">{h.changed_by_username}</strong></span>
                            {h.is_override && <span className="text-neon-purple font-bold">⚠️ OVERRIDE DE SUPERADMIN</span>}
                          </div>
                          {h.is_override && h.override_reason && (
                            <div className="mt-1.5 p-2 bg-neon-purple/5 border border-neon-purple/20 text-neon-purple text-[10px] rounded italic">
                              Motivo: {h.override_reason}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de cambio de estado */}
      {equipment && (
        <StatusChangeModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          equipmentId={equipment.id}
          currentStatusId={equipment.current_status_id}
          currentStatusName={equipment.status_name}
          currentStatusColor={equipment.status_color}
          nextStates={nextStates}
          onSuccess={handleStatusChangeSuccess}
        />
      )}
    </>
  )
}
