// types/database.types.ts
// Este archivo se genera automáticamente con Supabase CLI
// Ejecutar cuando el esquema esté creado en Supabase:
//   npx supabase gen types typescript --project-id <ID> > types/database.types.ts
//
// Por ahora se usa un placeholder hasta tener el proyecto de Supabase configurado.

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          role: 'superadmin' | 'admin' | 'operaciones' | 'recepcion' | 'almacen' | 'visualizador'
          is_active: boolean
          is_superadmin: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          role?: 'superadmin' | 'admin' | 'operaciones' | 'recepcion' | 'almacen' | 'visualizador'
          is_active?: boolean
          is_superadmin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: 'superadmin' | 'admin' | 'operaciones' | 'recepcion' | 'almacen' | 'visualizador'
          is_active?: boolean
          is_superadmin?: boolean
          created_at?: string
        }
      }
      workflow_states: {
        Row: {
          id: number
          name: string
          order_index: number
          is_initial: boolean
          is_terminal: boolean
          color: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          order_index: number
          is_initial?: boolean
          is_terminal?: boolean
          color?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          order_index?: number
          is_initial?: boolean
          is_terminal?: boolean
          color?: string
          created_at?: string
        }
      }
      workflow_transitions: {
        Row: {
          id: number
          from_state_id: number
          to_state_id: number
          allowed_roles: string[]
          created_at: string
        }
        Insert: {
          id?: number
          from_state_id: number
          to_state_id: number
          allowed_roles: string[]
          created_at?: string
        }
        Update: {
          id?: number
          from_state_id?: number
          to_state_id?: number
          allowed_roles?: string[]
          created_at?: string
        }
      }
      equipment_records: {
        Row: {
          id: string
          fr_number: string
          report_number: string | null
          client_name: string
          service_type: 'GARANTIA_CABELAB' | 'GARANTIA_ESAB' | 'REVISION_GENERAL'
          current_status_id: number
          brand: string
          model: string
          serial_number: string
          client_report: string | null
          accessories: string | null
          condition_in: string | null
          additional_observations: string | null
          date_in: string
          start_diagnosis_at: string | null
          end_diagnosis_at: string | null
          pending_approval_at: string | null
          approval_at: string | null
          start_maintenance_at: string | null
          end_maintenance_at: string | null
          finalized_at: string | null
          updated_at: string
          assigned_technician_ids: number[]
          created_by: string | null
        }
        Insert: {
          id?: string
          fr_number: string
          report_number?: string | null
          client_name: string
          service_type: 'GARANTIA_CABELAB' | 'GARANTIA_ESAB' | 'REVISION_GENERAL'
          current_status_id: number
          brand: string
          model: string
          serial_number: string
          client_report?: string | null
          accessories?: string | null
          condition_in?: string | null
          additional_observations?: string | null
          date_in?: string
          start_diagnosis_at?: string | null
          end_diagnosis_at?: string | null
          pending_approval_at?: string | null
          approval_at?: string | null
          start_maintenance_at?: string | null
          end_maintenance_at?: string | null
          finalized_at?: string | null
          updated_at?: string
          assigned_technician_ids?: number[]
          created_by?: string | null
        }
        Update: {
          id?: string
          fr_number?: string
          report_number?: string | null
          client_name?: string
          service_type?: 'GARANTIA_CABELAB' | 'GARANTIA_ESAB' | 'REVISION_GENERAL'
          current_status_id?: number
          brand?: string
          model?: string
          serial_number?: string
          client_report?: string | null
          accessories?: string | null
          condition_in?: string | null
          additional_observations?: string | null
          date_in?: string
          start_diagnosis_at?: string | null
          end_diagnosis_at?: string | null
          pending_approval_at?: string | null
          approval_at?: string | null
          start_maintenance_at?: string | null
          end_maintenance_at?: string | null
          finalized_at?: string | null
          updated_at?: string
          assigned_technician_ids?: number[]
          created_by?: string | null
        }
      }
      status_history: {
        Row: {
          id: number
          equipment_id: string
          previous_status: string | null
          new_status: string
          changed_by_id: string | null
          changed_by_username: string
          is_override: boolean
          override_reason: string | null
          timestamp: string
        }
        Insert: {
          id?: number
          equipment_id: string
          previous_status?: string | null
          new_status: string
          changed_by_id?: string | null
          changed_by_username: string
          is_override?: boolean
          override_reason?: string | null
          timestamp?: string
        }
        Update: {
          id?: number
          equipment_id?: string
          previous_status?: string | null
          new_status?: string
          changed_by_id?: string | null
          changed_by_username?: string
          is_override?: boolean
          override_reason?: string | null
          timestamp?: string
        }
      }
    }
    Views: {
      equipment_with_status: {
        Row: {
          id: string
          fr_number: string
          report_number: string | null
          client_name: string
          service_type: 'GARANTIA_CABELAB' | 'GARANTIA_ESAB' | 'REVISION_GENERAL'
          current_status_id: number
          brand: string
          model: string
          serial_number: string
          client_report: string | null
          accessories: string | null
          condition_in: string | null
          additional_observations: string | null
          date_in: string
          start_diagnosis_at: string | null
          end_diagnosis_at: string | null
          pending_approval_at: string | null
          approval_at: string | null
          start_maintenance_at: string | null
          end_maintenance_at: string | null
          finalized_at: string | null
          updated_at: string
          assigned_technician_ids: number[]
          created_by: string | null
          status_name: string
          status_color: string
          is_terminal: boolean
          days_elapsed: number
          phase_1_days: number
          phase_2_days: number
          phase_3_days: number
          assigned_technicians: string[] | null
        }
      }
    }
    Functions: Record<string, never>
    Enums: {
      user_role_enum: 'superadmin' | 'admin' | 'operaciones' | 'recepcion' | 'almacen' | 'visualizador'
      service_type_enum: 'GARANTIA_CABELAB' | 'GARANTIA_ESAB' | 'REVISION_GENERAL'
    }
  }
}
