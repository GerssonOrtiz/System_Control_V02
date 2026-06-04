// lib/validations/equipment.schema.ts
import { z } from 'zod'

export const createEquipmentSchema = z.object({
  fr_number: z.string()
    .min(3, { message: 'El número de FR debe tener al menos 3 caracteres' })
    .regex(/^FR-\d+$/i, { message: 'El formato de FR debe ser FR-SeguidoDeNúmeros (ej: FR-042)' }),
  client_name: z.string().min(2, { message: 'El nombre del cliente es obligatorio' }),
  service_type: z.enum(['GARANTIA_CABELAB', 'GARANTIA_ESAB', 'REVISION_GENERAL']),
  brand: z.string().min(1, { message: 'La marca es obligatoria' }),
  model: z.string().min(1, { message: 'El modelo es obligatorio' }),
  serial_number: z.string().min(1, { message: 'El número de serie es obligatorio' }),
  client_report: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  condition_in: z.string().optional().nullable(),
  additional_observations: z.string().optional().nullable(),
})

export const updateStatusSchema = z.object({
  new_status_id: z.number().int({ message: 'ID de estado inválido' }),
  diagnosis_tech_id: z.string().uuid().optional().nullable(),
  maintenance_tech_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const forceStatusSchema = z.object({
  new_status_id: z.number().int({ message: 'ID de estado inválido' }),
  override_reason: z.string().min(5, { message: 'El motivo del override debe tener al menos 5 caracteres' }),
})

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type ForceStatusInput = z.infer<typeof forceStatusSchema>
