// app/api/equipment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { canViewAllEquipment } from '@/types/user'

const CAN_VIEW_ALL = ['superadmin', 'admin', 'visualizador']

const ROLE_RELEVANT_STATES: Record<string, string[]> = {
  operaciones: [
    'En espera de diagnóstico',
    'En diagnóstico',
    'Repuesto entregado',
    'Aprobado',
    'Inicio de mantenimiento',
    'En mantenimiento',
    'En espera de repuesto adicional',
  ],
  recepcion: [
    'En espera de diagnóstico',
    'Pendiente de aprobación',
    'Servicio culminado',
  ],
  almacen: [
    'En espera de repuesto',
    'En espera de repuesto adicional',
  ],
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // 1. Verificar sesión
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    // 2. Obtener perfil del usuario
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, is_active, is_superadmin')
      .eq('id', session.user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ success: false, error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }

    const activeProfile = userProfile as any

    if (!activeProfile.is_active) {
      return NextResponse.json({ success: false, error: 'Cuenta no activa' }, { status: 403 })
    }

    // 3. Leer query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0', 10)
    const includeDelivered = searchParams.get('include_delivered') === 'true'
    const pageSize = 20

    // 4. Construir consulta sobre la vista equipment_with_status
    let query = supabase
      .from('equipment_with_status')
      .select('*', { count: 'exact' })

    // Filtrar por estados del rol si no tiene permiso general para ver todo
    const hasViewAll = CAN_VIEW_ALL.includes(activeProfile.role)
    if (!hasViewAll) {
      const relevantStates = ROLE_RELEVANT_STATES[activeProfile.role] || []
      query = query.in('status_name', relevantStates)
    }

    // Filtrar equipos entregados (terminales) si no se solicita incluirlos
    if (!includeDelivered) {
      query = query.eq('is_terminal', false)
    }

    // Paginación
    const from = page * pageSize
    const to = from + pageSize - 1
    
    const { data: equipments, count, error } = await query
      .order('date_in', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('[GET /api/equipment] Database error:', error)
      return NextResponse.json({ success: false, error: 'Error al consultar equipos de la base de datos' }, { status: 500 })
    }

    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: {
        equipments: equipments || [],
        total,
        page,
        page_size: pageSize,
        total_pages: totalPages,
      }
    })

  } catch (err) {
    console.error('[GET /api/equipment] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
