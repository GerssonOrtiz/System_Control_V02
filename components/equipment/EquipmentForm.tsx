// components/equipment/EquipmentForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createEquipmentSchema, CreateEquipmentInput } from '@/lib/validations/equipment.schema'
import { createClient } from '@/lib/supabase/client'

interface EquipmentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface Technician {
  id: number
  name: string
}

export default function EquipmentForm({ onSuccess, onCancel }: EquipmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTechnicians, setAvailableTechnicians] = useState<Technician[]>([])
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateEquipmentInput>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: {
      fr_number: '',
      client_name: '',
      service_type: 'REVISION_GENERAL',
      brand: '',
      model: '',
      serial_number: '',
      client_report: '',
      accessories: '',
      condition_in: '',
      additional_observations: '',
      assigned_technician_ids: [],
    },
  })

  const BRANDS = ["ESAB", "MILLER", "LINCOLN ELECTRIC", "DAF", "KENDE", "HYPERTHERM"]

  const selectedTechIds = watch('assigned_technician_ids') || []

  useEffect(() => {
    async function fetchTechnicians() {
      const { data, error } = await supabase
        .from('technicians')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      
      if (!error && data) {
        setAvailableTechnicians(data)
      }
    }
    fetchTechnicians()
  }, [])

  const toggleTechnician = (id: number) => {
    const current = [...selectedTechIds]
    const index = current.indexOf(id)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(id)
    }
    setValue('assigned_technician_ids', current)
  }

  const onSubmit = async (data: CreateEquipmentInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/equipment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const resData = await response.json()

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Ocurrió un error al registrar el equipo')
      }

      toast.success('Equipo registrado con éxito')
      reset()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al registrar equipo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 font-sans text-text-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Ficha de Recepción */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Ficha de Recepción (FR) *
          </label>
          <input
            type="text"
            {...register('fr_number')}
            placeholder="ej: 1199-1"
            className={`w-full bg-bg-base/50 border ${
              errors.fr_number ? 'border-red-500/50 focus:shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'border-border-subtle focus:border-neon-blue focus:shadow-[0_0_8px_rgba(0,229,255,0.2)]'
            } rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all font-mono`}
          />
          {errors.fr_number && (
            <p className="text-red-400 text-xs mt-1">{errors.fr_number.message}</p>
          )}
        </div>

        {/* Cliente */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Nombre del Cliente *
          </label>
          <input
            type="text"
            {...register('client_name')}
            placeholder="ej: ACME SAC"
            className={`w-full bg-bg-base/50 border ${
              errors.client_name ? 'border-red-500/50' : 'border-border-subtle focus:border-neon-blue'
            } rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all`}
          />
          {errors.client_name && (
            <p className="text-red-400 text-xs mt-1">{errors.client_name.message}</p>
          )}
        </div>

        {/* Tipo de Servicio */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Tipo de Servicio *
          </label>
          <select
            {...register('service_type')}
            className={`w-full bg-bg-base/50 border ${
              errors.service_type ? 'border-red-500/50' : 'border-border-subtle focus:border-neon-blue'
            } rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all`}
          >
            <option value="GARANTIA_CABELAB">GARANTÍA CABELAB</option>
            <option value="GARANTIA_ESAB">GARANTÍA ESAB</option>
            <option value="REVISION_GENERAL">REVISIÓN GENERAL</option>
          </select>
          {errors.service_type && (
            <p className="text-red-400 text-xs mt-1">{errors.service_type.message}</p>
          )}
        </div>

        {/* Marca */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Marca
          </label>
          <input
            type="text"
            list="brands-list"
            {...register('brand')}
            placeholder="ej: ESAB o escribe otra"
            className={`w-full bg-bg-base/50 border ${
              errors.brand ? 'border-red-500/50' : 'border-border-subtle focus:border-neon-blue'
            } rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all`}
          />
          <datalist id="brands-list">
            {BRANDS.map(b => (
              <option key={b} value={b} />
            ))}
          </datalist>
          {errors.brand && (
            <p className="text-red-400 text-xs mt-1">{errors.brand.message}</p>
          )}
        </div>

        {/* Modelo */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Modelo
          </label>
          <input
            type="text"
            {...register('model')}
            placeholder="ej: XMT 350 (opcional)"
            className={`w-full bg-bg-base/50 border ${
              errors.model ? 'border-red-500/50' : 'border-border-subtle focus:border-neon-blue'
            } rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all`}
          />
          {errors.model && (
            <p className="text-red-400 text-xs mt-1">{errors.model.message}</p>
          )}
        </div>

        {/* Número de Serie */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Número de Serie
          </label>
          <input
            type="text"
            {...register('serial_number')}
            placeholder="ej: SN-123456 (opcional)"
            className={`w-full bg-bg-base/50 border ${
              errors.serial_number ? 'border-red-500/50' : 'border-border-subtle focus:border-neon-blue'
            } rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all font-mono`}
          />
          {errors.serial_number && (
            <p className="text-red-400 text-xs mt-1">{errors.serial_number.message}</p>
          )}
        </div>

        {/* Técnicos Asignados */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Técnicos Asignados
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {availableTechnicians.map((tech) => {
              const isSelected = selectedTechIds.includes(tech.id)
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => toggleTechnician(tech.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    isSelected 
                      ? 'bg-neon-blue/20 border-neon-blue text-neon-blue shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                      : 'bg-bg-base/50 border-border-subtle text-text-muted hover:border-white/20'
                  }`}
                >
                  {tech.name.toUpperCase()}
                </button>
              )
            })}
            {availableTechnicians.length === 0 && (
              <span className="text-[10px] text-text-muted italic">No hay técnicos disponibles</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Reporte del cliente */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Reporte del cliente / Falla
          </label>
          <textarea
            {...register('client_report')}
            placeholder="ej: NO ENCIENDE AL PRIMER INTENTO"
            rows={3}
            className="w-full bg-bg-base/50 border border-border-subtle focus:border-neon-blue rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Accesorios */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Accesorios incluidos
          </label>
          <textarea
            {...register('accessories')}
            placeholder="ej: CABLE DE TIERRA, CARETA"
            rows={3}
            className="w-full bg-bg-base/50 border border-border-subtle focus:border-neon-blue rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Condición de ingreso */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Condición física de ingreso
          </label>
          <textarea
            {...register('condition_in')}
            placeholder="ej: GOLPE EN PANEL LATERAL"
            rows={3}
            className="w-full bg-bg-base/50 border border-border-subtle focus:border-neon-blue rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Observaciones adicionales */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Observaciones adicionales
          </label>
          <textarea
            {...register('additional_observations')}
            placeholder="ej: CLIENTE INDICA QUE EL PROBLEMA ES RECIENTE"
            rows={3}
            className="w-full bg-bg-base/50 border border-border-subtle focus:border-neon-blue rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-all resize-none"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold border border-neon-blue text-neon-blue rounded-lg hover:bg-neon-blue/10 transition-all uppercase"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-electric text-white shadow-neon-blue hover:brightness-110 transition-all uppercase disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Equipo'}
        </button>
      </div>
    </form>
  )
}
