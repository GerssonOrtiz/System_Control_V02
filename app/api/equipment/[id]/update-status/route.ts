// app/api/equipment/[id]/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { updateStatusSchema } from '@/lib/validations/equipment.schema'
import { WorkflowEngine } from '@/lib/workflow/engine'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: equipmentId } = await params
    const supabase = await createServerClient()

    // 1. Verificar sesión
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    // 2. Obtener perfil
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('username, role, is_active')
      .eq('id', session.user.id)
      .single()

    const activeProfile = userProfile as any

    if (!activeProfile?.is_active) {
      return NextResponse.json({ success: false, error: 'Cuenta no activa' }, { status: 403 })
    }

    // 3. Validar body con Zod
    const body = await request.json()
    const parsed = updateStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos de actualización inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { new_status_id, diagnosis_tech_id, maintenance_tech_id, notes } = parsed.data

    // 4. Verificar existencia de equipo
    const { data: equipment, error: eqError } = await supabase
      .from('equipment_records')
      .select('current_status_id')
      .eq('id', equipmentId)
      .single()

    if (eqError || !equipment) {
      return NextResponse.json({ success: false, error: 'Equipo no encontrado' }, { status: 404 })
    }

    const activeEquipment = equipment as any

    // 5. Verificar si el equipo ya está en estado terminal
    const isTerminal = await WorkflowEngine.isTerminal(activeEquipment.current_status_id)
    if (isTerminal) {
      return NextResponse.json({ success: false, error: 'El equipo ya está en estado terminal y no puede avanzar' }, { status: 422 })
    }

    // 6. Obtener los detalles del estado destino
    const { data: targetState, error: targetError } = await supabase
      .from('workflow_states')
      .select('name, color')
      .eq('id', new_status_id)
      .single()

    const activeTargetState = targetState as any

    if (targetError || !activeTargetState) {
      return NextResponse.json({ success: false, error: 'El estado destino seleccionado no existe en el workflow' }, { status: 404 })
    }

    // 7. Validar transiciones según motor de workflow
    const validation = await WorkflowEngine.validateTransition(
      activeEquipment.current_status_id,
      new_status_id,
      activeProfile.role
    )

    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error || 'Transición de estado no permitida' }, { status: 422 })
    }

    // 8. Validaciones específicas del negocio e ingresos de campos condicionales
    // 'En diagnóstico' = ID o Nombre. Buscamos por nombre para que el motor sea dinámico.
    if (activeTargetState.name.trim().toLowerCase() === 'en diagnóstico') {
      if (!diagnosis_tech_id) {
        return NextResponse.json({ success: false, error: 'El técnico asignado es requerido para cambiar a este estado' }, { status: 400 })
      }
    }

    if (activeTargetState.name.trim().toLowerCase() === 'en mantenimiento') {
      if (!maintenance_tech_id) {
        return NextResponse.json({ success: false, error: 'El técnico de mantenimiento es requerido para iniciar la fase de servicio' }, { status: 400 })
      }
    }

    // 9. Actualizar el equipo en la BD
    // Los triggers automáticos 'auto_log_status_change' y 'auto_track_timestamps' se encargarán del historial y de los timestamps
    // Pero como estamos enviando campos de técnicos de forma opcional, debemos estructurar el update
    const updateData: Record<string, any> = {
      current_status_id: new_status_id,
      additional_observations: notes?.trim().toUpperCase() || null,
    }

    if (diagnosis_tech_id) {
      updateData.diagnosis_tech_id = diagnosis_tech_id
    }
    if (maintenance_tech_id) {
      updateData.maintenance_tech_id = maintenance_tech_id
    }

    const { error: updateError } = await (supabase
      .from('equipment_records') as any)
      .update(updateData)
      .eq('id', equipmentId)

    if (updateError) {
      console.error('[POST update-status] Database update error:', updateError)
      return NextResponse.json({ success: false, error: 'Ocurrió un error al actualizar el estado del equipo en la base de datos' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        new_status_name: activeTargetState.name,
        new_status_color: activeTargetState.color,
      }
    })

  } catch (err) {
    console.error('[POST update-status] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
